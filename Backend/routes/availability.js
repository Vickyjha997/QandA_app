const express = require('express');
const router = express.Router();
const Availability = require('../models/Availability');
const Tutor = require('../models/Tutor'); // ✅ ADD THIS LINE
const protect = require('../middleware/protect');

// Get tutor's availability slots
router.get('/tutor/:tutorId', async (req, res) => {
  try {
    const availability = await Availability.find({
      tutorId: req.params.tutorId,
      date: { $gte: new Date() },
      isBooked: false
    }).sort({ date: 1, startTime: 1 });
    
    res.json({ success: true, availability });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch availability', error: error.message });
  }
});

// DEBUG ROUTE - Add this temporarily to see what's in your database
router.get('/debug/all', async (req, res) => {
  try {
    const allAvailability = await Availability.find({})
      .populate('tutorId')
      .sort({ createdAt: -1 })
      .limit(10);
    
    const allTutors = await Tutor.find({});
    
    res.json({
      totalAvailability: allAvailability.length,
      availability: allAvailability.map(a => ({
        _id: a._id.toString(),
        tutorId: a.tutorId ? a.tutorId._id.toString() : 'NULL',
        tutorName: a.tutorId ? a.tutorId.name : 'NULL',
        tutorSubject: a.tutorId ? a.tutorId.subject : 'NULL',
        date: a.date,
        startTime: a.startTime,
        endTime: a.endTime,
        isBooked: a.isBooked,
        isPast: a.date < new Date()
      })),
      tutors: allTutors.map(t => ({
        _id: t._id.toString(),
        name: t.name,
        subject: t.subject,
        email: t.email
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set/Update tutor availability (Tutor only)
router.post('/set', protect, async (req, res) => {
  try {
    console.log('🔍 req.user:', req.user);
    
    if (req.user.role !== 'tutor') {
      return res.status(403).json({ success: false, message: 'Only tutors can set availability' });
    }

    // ✅ Verify the tutor exists in the database
    const tutor = await Tutor.findById(req.user.id);
    
    if (!tutor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tutor not found in database',
        userId: req.user.id 
      });
    }

    console.log('✅ Found tutor:', {
      id: tutor._id.toString(),
      name: tutor.name,
      subject: tutor.subject
    });

    const { slots } = req.body;
    
    if (!slots || !Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide valid time slots' });
    }

    console.log('📅 Received slots:', slots);

    // Validate each slot and check if dates are in the future
    const now = new Date();
    for (const slot of slots) {
      if (!slot.date || !slot.startTime || !slot.endTime) {
        return res.status(400).json({ 
          success: false, 
          message: 'Each slot must have date, startTime, and endTime' 
        });
      }

      const slotDate = new Date(slot.date);
      if (slotDate < now) {
        console.log('⚠️ WARNING: Slot date is in the past:', slot.date, 'Current date:', now);
      }
    }

    const availabilitySlots = slots.map(slot => ({
      tutorId: tutor._id, // ✅ Use tutor._id directly
      date: new Date(slot.date),
      startTime: slot.startTime,
      endTime: slot.endTime,
      duration: slot.duration || 60,
      isBooked: false
    }));

    console.log('💾 Creating availability slots for tutor:', tutor._id.toString());
    console.log('📋 Slots to create:', availabilitySlots);

    const result = await Availability.insertMany(availabilitySlots);
    console.log('✅ Successfully created:', result.length, 'slots');

    res.status(201).json({ 
      success: true, 
      message: 'Availability set successfully',
      count: result.length
    });
  } catch (error) {
    console.error('❌ Error setting availability:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to set availability',
      error: error.message 
    });
  }
});

// Get my availability (Tutor)
router.get('/my-slots', protect, async (req, res) => {
  try {
    if (req.user.role !== 'tutor') {
      return res.status(403).json({ success: false, message: 'Only tutors can view their slots' });
    }

    const availability = await Availability.find({
      tutorId: req.user.id,
      date: { $gte: new Date() }
    }).sort({ date: 1, startTime: 1 });

    res.json({ success: true, availability });
  } catch (error) {
    console.error('Error fetching my slots:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch availability', error: error.message });
  }
});

// Delete availability slot
router.delete('/:slotId', protect, async (req, res) => {
  try {
    if (req.user.role !== 'tutor') {
      return res.status(403).json({ success: false, message: 'Only tutors can delete slots' });
    }

    const slot = await Availability.findById(req.params.slotId);
    
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }

    if (slot.tutorId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (slot.isBooked) {
      return res.status(400).json({ success: false, message: 'Cannot delete booked slot' });
    }

    await Availability.findByIdAndDelete(req.params.slotId);
    res.json({ success: true, message: 'Slot deleted successfully' });
  } catch (error) {
    console.error('Error deleting slot:', error);
    res.status(500).json({ success: false, message: 'Failed to delete slot', error: error.message });
  }
});

module.exports = router;
