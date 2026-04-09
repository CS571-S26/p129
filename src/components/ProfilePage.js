import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';

function ProfilePage({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: user?.name || 'Runner',
    email: user?.email || 'runner@madcitymiles.com',
    joinDate: 'March 2026',
    location: 'Madison, WI',
    preferredPace: '9:30 /mi'
  });

  const rsvpEvents = [
    { id: 1, name: 'Morning Run at Lake Monona', date: 'Tomorrow', status: 'Confirmed' },
    { id: 2, name: 'Arboretum Trail Run', date: 'Saturday', status: 'Pending' }
  ];

  const achievements = [
    { name: 'First Run', icon: '🏃', date: 'March 2026' },
    { name: '5 Miles Club', icon: '🏅', date: 'March 2026' }
  ];

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className="profile-page">
      <Container className="mt-4 mb-5">
        <Row>
          <Col lg={4} md={12} className="mb-4">
            <Card className="profile-card text-center">
              <Card.Body>
                <div className="profile-avatar">
                  🏃‍♂️
                </div>
                <h3 className="profile-name">{userInfo.name}</h3>
                <p className="profile-email">{userInfo.email}</p>
                <Badge bg="danger" className="member-badge">Member since {userInfo.joinDate}</Badge>
                <Button
                  variant={isEditing ? "success" : "outline-danger"}
                  className="edit-profile-btn mt-3"
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                >
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={8} md={12}>
            <Card className="info-card mb-4">
              <Card.Header as="h5">Running Stats</Card.Header>
              <Card.Body>
                <Row>
                  <Col sm={6}>
                    <div className="stat-item">
                      <span className="stat-label">Total Miles</span>
                      <span className="stat-number">42</span>
                    </div>
                  </Col>
                  <Col sm={6}>
                    <div className="stat-item">
                      <span className="stat-label">Average Pace</span>
                      <span className="stat-number">{userInfo.preferredPace}</span>
                    </div>
                  </Col>
                  <Col sm={6}>
                    <div className="stat-item">
                      <span className="stat-label">Runs Completed</span>
                      <span className="stat-number">8</span>
                    </div>
                  </Col>
                  <Col sm={6}>
                    <div className="stat-item">
                      <span className="stat-label">Events RSVP'd</span>
                      <span className="stat-number">{rsvpEvents.length}</span>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="info-card mb-4">
              <Card.Header as="h5">RSVP'd Events</Card.Header>
              <Card.Body>
                {rsvpEvents.map((event) => (
                  <div key={event.id} className="event-item">
                    <div>
                      <strong>{event.name}</strong>
                      <p className="event-date">{event.date}</p>
                    </div>
                    <Badge bg={event.status === 'Confirmed' ? 'success' : 'warning'}>
                      {event.status}
                    </Badge>
                  </div>
                ))}
              </Card.Body>
            </Card>

            <Card className="info-card">
              <Card.Header as="h5">Achievements</Card.Header>
              <Card.Body>
                <Row>
                  {achievements.map((achievement, index) => (
                    <Col key={index} sm={6}>
                      <div className="achievement-item">
                        <span className="achievement-icon">{achievement.icon}</span>
                        <div>
                          <div className="achievement-name">{achievement.name}</div>
                          <small className="achievement-date">{achievement.date}</small>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default ProfilePage;