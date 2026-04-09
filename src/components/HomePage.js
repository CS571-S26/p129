import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

function HomePage({ user }) {
  const stats = [
    { icon: '🏃', value: '42', label: 'Total Miles' },
    { icon: '📅', value: '3', label: 'Upcoming Runs' },
    { icon: '👥', value: '12', label: 'Running Partners' },
    { icon: '🏆', value: '2', label: 'Events Joined' }
  ];

  const upcomingRuns = [
    { id: 1, name: 'Morning Run at Lake Monona', date: 'Tomorrow 7:00 AM', distance: '5 miles', pace: '9:30/mi' },
    { id: 2, name: 'Arboretum Trail Run', date: 'Saturday 8:00 AM', distance: '4 miles', pace: '10:00/mi' },
    { id: 3, name: 'Campus Loop', date: 'Sunday 9:00 AM', distance: '3 miles', pace: '8:45/mi' }
  ];

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
          {stats.map((stat, index) => (
            <Col key={index} md={3} sm={6} className="mb-3">
              <Card className="stat-card text-center">
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
            <h2 className="section-title">Upcoming Runs</h2>
          </Col>
        </Row>

        <Row>
          {upcomingRuns.map((run) => (
            <Col key={run.id} md={4} className="mb-3">
              <Card className="run-card">
                <Card.Body>
                  <Card.Title>{run.name}</Card.Title>
                  <div className="run-details">
                    <p>📅 {run.date}</p>
                    <p>📍 Distance: {run.distance}</p>
                    <p>⏱️ Pace: {run.pace}</p>
                  </div>
                  <Button variant="danger" className="rsvp-btn">RSVP Now</Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Row className="mt-4 mb-5">
          <Col className="text-center">
            <Button variant="outline-danger" size="lg" className="explore-btn">
              Explore All Routes →
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default HomePage;