import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, query, where, getDocs as getDocsQuery, doc, updateDoc, increment } from 'firebase/firestore';
import './UpcomingEventsPage.css';

function UpcomingEventsPage({ user }) {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [userRsvps, setUserRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rsvpNotes, setRsvpNotes] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchEvents();
    if (user) {
      fetchUserRsvps();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "events"));
      const eventsData = [];
      querySnapshot.forEach((doc) => {
        eventsData.push({ id: doc.id, ...doc.data() });
      });
      setEvents(eventsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      setLoading(false);
    }
  };

  const fetchUserRsvps = async () => {
    try {
      const q = query(collection(db, "rsvps"), where("userId", "==", user.email));
      const querySnapshot = await getDocsQuery(q);
      const rsvpsData = [];
      querySnapshot.forEach((doc) => {
        rsvpsData.push(doc.data().eventId);
      });
      setUserRsvps(rsvpsData);
    } catch (error) {
      console.error("Error fetching RSVPs:", error);
    }
  };

  const handleRSVP = async () => {
    if (!user) {
      alert("Please log in to RSVP");
      return;
    }

    try {
      await addDoc(collection(db, "rsvps"), {
        userId: user.email,
        userName: user.name || user.email.split('@')[0],
        eventId: selectedEvent.id,
        eventName: selectedEvent.name,
        eventDate: selectedEvent.date,
        eventTime: selectedEvent.time,
        meetingPoint: selectedEvent.meetingPoint,
        notes: rsvpNotes,
        rsvpDate: new Date().toISOString(),
        status: "confirmed",
        routeDistance: selectedEvent.distance,
        routeDifficulty: "Easy"
      });
      
      const eventRef = doc(db, "events", selectedEvent.id);
      await updateDoc(eventRef, {
        currentParticipants: increment(1)
      });
      
      setUserRsvps([...userRsvps, selectedEvent.id]);
      setEvents(events.map(event => 
        event.id === selectedEvent.id 
          ? { ...event, currentParticipants: (event.currentParticipants || 0) + 1 }
          : event
      ));
      
      setShowRSVPModal(false);
      setRsvpNotes('');
      setSelectedEvent(null);
      setSuccessMessage(`✅ Successfully RSVP'd for ${selectedEvent.name}!`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving RSVP:", error);
      alert("Failed to RSVP. Please try again.");
    }
  };

  const cancelRSVP = async (event) => {
    try {
      const q = query(collection(db, "rsvps"), 
        where("userId", "==", user.email), 
        where("eventId", "==", event.id)
      );
      const querySnapshot = await getDocsQuery(q);
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
      
      const eventRef = doc(db, "events", event.id);
      await updateDoc(eventRef, {
        currentParticipants: increment(-1)
      });
      
      setUserRsvps(userRsvps.filter(id => id !== event.id));
      setEvents(events.map(e => 
        e.id === event.id 
          ? { ...e, currentParticipants: Math.max(0, (e.currentParticipants || 0) - 1) }
          : e
      ));
      
      setSuccessMessage(`❌ Canceled RSVP for ${event.name}`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error canceling RSVP:", error);
      alert("Failed to cancel RSVP. Please try again.");
    }
  };

  const isRsvpd = (eventId) => {
    return userRsvps.includes(eventId);
  };

  if (loading) {
    return (
      <div className="events-loading">
        <Spinner animation="border" variant="danger" />
        <p>Loading events...</p>
      </div>
    );
  }

  return (
    <div className="upcoming-events-page">
      {showSuccess && (
        <div className="success-alert">
          {successMessage}
        </div>
      )}

      <div className="events-hero">
        <Container>
          <h1>Upcoming Group Runs 📅</h1>
          <p>Join fellow runners for group events in Madison</p>
          <p className="text-light">Logged in as: <strong>{user?.email}</strong></p>
        </Container>
      </div>

      <Container className="mt-4 mb-5">
        {events.length === 0 ? (
          <div className="no-events">
            <span className="no-events-icon">🏃</span>
            <h3>No upcoming events yet</h3>
            <p>Check back soon for group runs and events!</p>
            <Button variant="danger" onClick={() => navigate('/discover')}>Browse Routes Instead</Button>
          </div>
        ) : (
          <Row>
            {events.map((event) => (
              <Col md={6} lg={4} key={event.id} className="mb-4">
                <Card className="event-card">
                  <Card.Body>
                    <div className="event-card-header">
                      <Card.Title>{event.name}</Card.Title>
                      <Badge bg={isRsvpd(event.id) ? "success" : "danger"}>
                        {isRsvpd(event.id) ? "RSVP'd ✓" : "Open"}
                      </Badge>
                    </div>
                    <div className="event-datetime">
                      <div>📅 {event.date}</div>
                      <div>⏰ {event.time}</div>
                    </div>
                    <div className="event-location">
                      📍 {event.meetingPoint}
                    </div>
                    <div className="event-stats">
                      <span>📏 {event.distance}</span>
                      <span>⏱️ {event.pace}</span>
                    </div>
                    <div className="event-participants">
                      👥 {event.currentParticipants || 0} / {event.maxParticipants} participants
                    </div>
                    <Card.Text className="mt-3">
                      {event.description}
                    </Card.Text>
                    <div className="event-actions">
                      {isRsvpd(event.id) ? (
                        <Button variant="outline-danger" size="sm" onClick={() => cancelRSVP(event)}>
                          Cancel RSVP
                        </Button>
                      ) : (
                        <Button variant="danger" size="sm" onClick={() => {
                          setSelectedEvent(event);
                          setShowRSVPModal(true);
                        }}>
                          RSVP Now
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      <Modal show={showRSVPModal} onHide={() => setShowRSVPModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>RSVP for {selectedEvent?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Date:</strong> {selectedEvent?.date} at {selectedEvent?.time}</p>
          <p><strong>Location:</strong> {selectedEvent?.meetingPoint}</p>
          <p><strong>Distance:</strong> {selectedEvent?.distance}</p>
          <p><strong>Current Participants:</strong> {selectedEvent?.currentParticipants || 0} / {selectedEvent?.maxParticipants}</p>
          <Form.Group className="mt-3">
            <Form.Label>Any notes for the organizer?</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              placeholder="Optional: Let us know if you have any questions..."
              value={rsvpNotes}
              onChange={(e) => setRsvpNotes(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRSVPModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleRSVP}>
            Confirm RSVP
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default UpcomingEventsPage;