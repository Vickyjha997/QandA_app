const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const Availability = require('../models/Availability');
const Tutor = require('../models/Tutor');
const protect = require('../middleware/protect');

function generateMeetLink() {
  const room = Math.random().toString(36).substring(2, 10);
  return `https://meet.jit.si/qanda-${room}`;
}

// Get available time slots for a subject
router.get('/available-slots/:subject', async (req, res) => {
  try {
    const { subject } = req.params;
    
    console.log('🔍 Searching for subject:', subject);
    
    // Find all tutors teaching this subject
    const tutors = await Tutor.find({ subject });
    
    console.log('👨‍🏫 Found tutors:', tutors.length);
    if (tutors.length > 0) {
      console.log('Tutor details:', tutors.map(t => ({
        id: t._id.toString(),
        name: t.name,
        subject: t.subject,
        email: t.email
      })));
    }
    
    if (tutors.length === 0) {
      return res.json({ 
        success: true, 
        slots: [], 
        message: `No tutors available for ${subject}` 
      });
    }

    const tutorIds = tutors.map(t => t._id);
    console.log('🔑 Searching for availability with tutor IDs:', tutorIds.map(id => id.toString()));

    // Find all available slots for these tutors
    const slots = await Availability.find({
      tutorId: { $in: tutorIds },
      date: { $gte: new Date() },
      isBooked: false
    })
    .populate('tutorId', 'name subject')
    .sort({ date: 1, startTime: 1 });

    console.log('📅 Found availability slots:', slots.length);
    
    if (slots.length > 0) {
      console.log('Slot details:', slots.map(s => ({
        id: s._id.toString(),
        tutorId: s.tutorId ? s.tutorId._id.toString() : 'null',
        tutorName: s.tutorId ? s.tutorId.name : 'null',
        date: s.date,
        time: `${s.startTime}-${s.endTime}`,
        isBooked: s.isBooked
      })));
    } else {
      // Debug: check if ANY availability exists for these tutors
      const allSlots = await Availability.find({ tutorId: { $in: tutorIds } });
      console.log('⚠️ Total slots (including past/booked):', allSlots.length);
      
      if (allSlots.length > 0) {
        console.log('Slot breakdown:', {
          past: allSlots.filter(s => s.date < new Date()).length,
          booked: allSlots.filter(s => s.isBooked).length,
          available: allSlots.filter(s => s.date >= new Date() && !s.isBooked).length
        });
      }
    }

    if (slots.length === 0) {
      return res.json({ 
        success: true, 
        slots: [], 
        message: `No available time slots for ${subject} at this moment` 
      });
    }

    res.json({ 
      success: true, 
      slots,
      tutorCount: tutors.length,
      message: `${slots.length} available slots found` 
    });
  } catch (error) {
    console.error('❌ Error fetching available slots:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch available slots', error: error.message });
  }
});

// Smart meeting scheduling - finds available tutor automatically
router.post('/schedule', protect, async (req, res) => {
  try {
    const { subject, topic, availabilitySlotId } = req.body;
    
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can schedule meetings' });
    }

    if (!subject || !topic || !availabilitySlotId) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Find the availability slot
    const slot = await Availability.findById(availabilitySlotId).populate('tutorId');
    
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Time slot not found' });
    }

    if (slot.isBooked) {
      return res.status(400).json({ success: false, message: 'This time slot is already booked' });
    }

    // Check if the tutor's subject matches
    if (slot.tutorId.subject !== subject) {
      return res.status(400).json({ 
        success: false, 
        message: `This tutor teaches ${slot.tutorId.subject}, not ${subject}` 
      });
    }

    // Mark slot as booked
    slot.isBooked = true;
    await slot.save();

    // Create meeting datetime
    const scheduledAt = new Date(`${slot.date.toISOString().split('T')[0]}T${slot.startTime}:00`);

    const meetLink = generateMeetLink();
    
    // Create meeting
    const meeting = await Meeting.create({
      studentId: req.user.id,
      tutorId: slot.tutorId._id,
      subject,
      topic,
      scheduledAt,
      duration: slot.duration,
      meetLink,
      status: 'scheduled',
      availabilitySlotId
    });

    await meeting.populate('studentId', 'name email class');
    await meeting.populate('tutorId', 'name email subject');

    // Emit socket events
    const io = req.app.get('io');
    if (io) {
      io.to('tutors').emit('new-meeting', { meeting });
      io.to('students').emit('meeting-scheduled', { meeting });
    }

    res.status(201).json({ 
      success: true, 
      meeting,
      message: `Meeting scheduled with ${slot.tutorId.name}!`
    });
  } catch (error) {
    console.error('Error scheduling meeting:', error);
    res.status(500).json({ success: false, message: 'Failed to schedule meeting', error: error.message });
  }
});

// Get my meetings
router.get('/my-meetings', protect, async (req, res) => {
  try {
    let meetings;
    
    if (req.user.role === 'student') {
      meetings = await Meeting.find({ studentId: req.user.id })
        .populate('tutorId', 'name email subject')
        .sort({ scheduledAt: -1 });
    } else if (req.user.role === 'tutor') {
      meetings = await Meeting.find({ tutorId: req.user.id })
        .populate('studentId', 'name email class')
        .sort({ scheduledAt: -1 });
    } else {
      return res.status(403).json({ success: false, message: 'Invalid user role' });
    }

    res.json({ success: true, meetings });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch meetings', error: error.message });
  }
});

// Cancel a meeting
router.put('/:meetingId/cancel', protect, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.meetingId);
    
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    if (req.user.role === 'student' && meeting.studentId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (req.user.role === 'tutor' && meeting.tutorId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    meeting.status = 'cancelled';
    await meeting.save();

    // Free up the availability slot
    if (meeting.availabilitySlotId) {
      await Availability.findByIdAndUpdate(meeting.availabilitySlotId, { isBooked: false });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('meeting-cancelled', { meetingId: meeting._id });
    }

    res.json({ success: true, message: 'Meeting cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling meeting:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel meeting', error: error.message });
  }
});

module.exports = router;
