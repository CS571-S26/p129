import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import './MyRsvpsPage.css';

function MyRsvpsPage({ user }) {
  const navigate = useNavigate();
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRsvps();
    }
  }, [user]);

  const fetchRsvps = async () => {
    try {
      const q = query(collection(db, "rsvps"), where("userId", "==", user.email));
      const querySnapshot = await getDocs(q);
      const rsvpsData = [];
      querySnapshot.forEach((doc) => {
        rsvpsData.push({ id: doc.id, ...doc.data() });
      });
      rsvpsData.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
      setRsvps(rsvpsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching RSVPs:", error);
      setLoading(false);
    }
  };

  const cancelRsvp = async (rsvpId, eventName) => {
    if (window.confirm(`Are you sure you want to cancel your RSVP for ${eventName}?`)) {
      try {
        await deleteDoc(doc(db, "rsvps", rsvpId));
        setRsvps(rsvps.filter(rsvp => rsvp.id !== rsvpId));
      } catch (error) {
        console.error("Error canceling RSVP:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="rsvps-loading">
        <Spinner animation="border" variant="danger" />
        <p>Loading your RSVPs...</p>
      </div>
    );
  }

  return (
    <div className="my-rsvps-page">
      <div className="rsvps-hero">
        <Container>
          <h1>My RSVPs 📋</h1>
          <p>View and manage your upcoming group runs</p>
          <p className="text-light">Logged in as: <strong>{user?.email}</strong></p>
        </Container>
      </div>

      <Container className="mt-4 mb-5">
        {rsvps.length === 0 ? (
          <div className="no-rsvps">
            <span className="no-rsvps-icon">📅</span>
            <h3>No RSVPs yet</h3>
            <p>Go to Upcoming Events and RSVP to join group runs!</p>
            <Button variant="danger" onClick={() => navigate('/events')}>View Upcoming Events</Button>
          </div>
        ) : (
          <Row>
            {rsvps.map((rsvp) => (
              <Col md={6} lg={4} key={rsvp.id} className="mb-4">
                <Card className="rsvp-card">
                  <Card.Body>
                    <div className="rsvp-card-header">
                      <Card.Title>{rsvp.eventName}</Card.Title>
                      <Badge bg="success">Confirmed</Badge>
                    </div>
                    <div className="rsvp-datetime">
                      <div>📅 {rsvp.eventDate}</div>
                      <div>⏰ {rsvp.eventTime}</div>
                    </div>
                    <div className="rsvp-stats">
                      <span>📏 {rsvp.routeDistance}</span>
                      <span>⭐ {rsvp.routeDifficulty}</span>
                    </div>
                    {rsvp.notes && (
                      <div className="rsvp-notes">
                        <strong>Your notes:</strong>
                        <p>{rsvp.notes}</p>
                      </div>
                    )}
                    <div className="rsvp-actions">
                      <Button variant="outline-danger" size="sm" onClick={() => cancelRsvp(rsvp.id, rsvp.eventName)}>
                        Cancel RSVP
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
}

export default MyRsvpsPage;