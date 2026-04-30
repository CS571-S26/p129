import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, query, where, getDocs as getDocsQuery } from 'firebase/firestore';
import './HomePage.css';

function HomePage({ user }) {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [userRsvps, setUserRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMiles: 0,
    upcomingRuns: 0,
    eventsJoined: 0
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const eventsSnapshot = await getDocs(collection(db, "events"));
      const eventsData = [];
      eventsSnapshot.forEach((doc) => {
        eventsData.push({ id: doc.id, ...doc.data() });
      });
      setEvents(eventsData);

      if (user) {
        const rsvpQuery = query(collection(db, "rsvps"), where("userId", "==", user.email));
        const rsvpSnapshot = await getDocsQuery(rsvpQuery);
        const rsvpData = [];
        rsvpSnapshot.forEach((doc) => {
          rsvpData.push(doc.data().eventId);
        });
        setUserRsvps(rsvpData);
        
        let totalMiles = 0;
        eventsData.forEach(event => {
          if (rsvpData.includes(event.id)) {
            const miles = parseFloat(event.distance) || 0;
            totalMiles += miles;
          }
        });
        
        setStats({
          totalMiles: totalMiles.toFixed(1),
          upcomingRuns: eventsData.filter(event => new Date(event.date) >= new Date()).length,
          eventsJoined: rsvpData.length
        });
      } else {
        setStats({
          totalMiles: 0,
          upcomingRuns: eventsData.length,
          eventsJoined: 0
        });
      }
    } catch (error) {
      console.error("Error fetching home data:", error);
    } finally {
      setLoading(false);
    }
  };

  const isRsvpd = (eventId) => {
    return userRsvps.includes(eventId);
  };

  const getParticipantStatus = (event) => {
    const current = event.currentParticipants || 0;
    const max = event.maxParticipants || 0;
    const spotsLeft = max - current;
    
    if (spotsLeft <= 0) return <Badge bg="danger">Full</Badge>;
    if (spotsLeft <= 5) return <Badge bg="warning">Only {spotsLeft} spots left!</Badge>;
    return <Badge bg="success">{spotsLeft} spots open</Badge>;
  };

  const statsCards = [
    { icon: '🏃', value: stats.totalMiles, label: 'Total Miles', color: '#FF6B6B' },
    { icon: '📅', value: stats.upcomingRuns, label: 'Upcoming Runs', color: '#4ECDC4' },
    { icon: '✅', value: stats.eventsJoined, label: 'Events Joined', color: '#96CEB4' }
  ];

  if (loading) {
    return (
      <div className="home-loading">
        <Spinner animation="border" variant="danger" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="hero-section">
        <Container>
          <Row className="text-center">
            <Col>
              <h1 className="hero-title">Welcome back, {user?.name || 'Runner'}! 👋</h1>
              <p className="hero-subtitle">Ready to hit the pavement today?</p>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="mt-4">
        <Row className="stats-row">
          {statsCards.map((stat, index) => (
            <Col key={index} md={4} sm={12} className="mb-3">
              <Card className="stat-card text-center" style={{ borderTop: `4px solid ${stat.color}` }}>
                <Card.Body>
                  <div className="stat-icon">{stat.icon}</div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Row className="mt-5">
          <Col>
            <h2 className="section-title">
              Upcoming Events 📅
              <Button 
                variant="outline-danger" 
                size="sm" 
                className="ms-3"
                onClick={() => navigate('/events')}
              >
                View All
              </Button>
            </h2>
          </Col>
        </Row>

        <Row>
          {events.length === 0 ? (
            <Col>
              <Card className="text-center p-5">
                <Card.Body>
                  <span style={{ fontSize: '48px' }}>🏃</span>
                  <h4 className="mt-3">No upcoming events yet</h4>
                  <p>Check back soon for group runs!</p>
                </Card.Body>
              </Card>
            </Col>
          ) : (
            events.slice(0, 3).map((event) => (
              <Col key={event.id} md={4} className="mb-3">
                <Card className="home-event-card">
                  <Card.Body>
                    <div className="event-card-header">
                      <Card.Title>{event.name}</Card.Title>
                      {getParticipantStatus(event)}
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
                    <Card.Text className="mt-2">
                      {event.description?.substring(0, 80)}...
                    </Card.Text>
                    <div className="event-actions">
                      {isRsvpd(event.id) ? (
                        <Badge bg="success" className="rsvp-badge">✓ RSVP'd</Badge>
                      ) : (
                        <Button 
                          variant="danger" 
                          size="sm" 
                          className="rsvp-btn"
                          onClick={() => navigate('/events')}
                        >
                          RSVP Now
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>

        <Row className="mt-4 mb-5">
          <Col className="text-center">
            <Button 
              variant="outline-danger" 
              size="lg" 
              className="explore-btn"
              onClick={() => navigate('/discover')}
            >
              Explore All Routes →
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default HomePage;