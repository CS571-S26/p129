import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import './ProfilePage.css';

function ProfilePage({ user }) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRsvps, setUserRsvps] = useState([]);
  const [userFavorites, setUserFavorites] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalMiles: 0,
    runsCompleted: 0,
    favoriteRoutes: 0,
    eventsJoined: 0,
    averagePace: '--',
    joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  });
  const [userInfo, setUserInfo] = useState({
    name: user?.name || 'Runner',
    email: user?.email || '',
    location: 'Madison, WI',
    preferredPace: '9:30 /mi',
    bio: 'Passionate runner exploring Madison trails!'
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [tempUserInfo, setTempUserInfo] = useState(userInfo);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Fetch user's RSVPs
      const rsvpQuery = query(collection(db, "rsvps"), where("userId", "==", user.email));
      const rsvpSnapshot = await getDocs(rsvpQuery);
      const rsvpData = [];
      rsvpSnapshot.forEach((doc) => {
        rsvpData.push({ id: doc.id, ...doc.data() });
      });
      setUserRsvps(rsvpData);

      // Fetch all events to get details
      const eventsSnapshot = await getDocs(collection(db, "events"));
      const eventsData = [];
      eventsSnapshot.forEach((doc) => {
        eventsData.push({ id: doc.id, ...doc.data() });
      });
      setEvents(eventsData);

      // Fetch user's favorites
      const favQuery = query(collection(db, "favorites"), where("userId", "==", user.email));
      const favSnapshot = await getDocs(favQuery);
      const favData = [];
      favSnapshot.forEach((doc) => {
        favData.push({ id: doc.id, ...doc.data() });
      });
      setUserFavorites(favData);

      // Calculate stats
      let totalMiles = 0;
      rsvpData.forEach(rsvp => {
        const miles = parseFloat(rsvp.routeDistance) || 0;
        totalMiles += miles;
      });

      setStats({
        totalMiles: totalMiles.toFixed(1),
        runsCompleted: rsvpData.length,
        favoriteRoutes: favData.length,
        eventsJoined: rsvpData.length,
        averagePace: userInfo.preferredPace,
        joinDate: stats.joinDate
      });

    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEventDetails = (eventId) => {
    return events.find(event => event.id === eventId);
  };

  const getEventStatus = (eventDate) => {
    const today = new Date();
    const eventDateObj = new Date(eventDate);
    if (eventDateObj < today) {
      return <Badge bg="secondary">Past</Badge>;
    }
    return <Badge bg="success">Upcoming</Badge>;
  };

  const handleEditClick = () => {
    setTempUserInfo(userInfo);
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    setUserInfo(tempUserInfo);
    setStats({
      ...stats,
      averagePace: tempUserInfo.preferredPace
    });
    setShowEditModal(false);
    setIsEditing(false);
    
    // Here you could save to a users collection in Firebase if you have one
    console.log("Profile updated:", tempUserInfo);
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <Spinner animation="border" variant="danger" />
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Container className="mt-4 mb-5">
        <Row>
          {/* Left Column - Profile Card */}
          <Col lg={4} md={12} className="mb-4">
            <Card className="profile-card text-center">
              <Card.Body>
                <div className="profile-avatar">
                  🏃‍♂️
                </div>
                <h3 className="profile-name">{userInfo.name}</h3>
                <p className="profile-email">{userInfo.email}</p>
                <div className="profile-location">
                  📍 {userInfo.location}
                </div>
                <Badge bg="danger" className="member-badge mt-2">
                  Member since {stats.joinDate}
                </Badge>
                <Button
                  variant="outline-danger"
                  className="edit-profile-btn mt-3"
                  onClick={handleEditClick}
                >
                  ✏️ Edit Profile
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column - Stats and Info */}
          <Col lg={8} md={12}>
            {/* Running Stats Card */}
            <Card className="info-card mb-4">
              <Card.Header as="h5">
                Running Stats 📊
                <Badge bg="info" className="ms-2">Live Data</Badge>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col sm={6} md={3} className="mb-3">
                    <div className="stat-item">
                      <div className="stat-icon">🏃</div>
                      <div className="stat-label">Total Miles</div>
                      <div className="stat-number">{stats.totalMiles}</div>
                    </div>
                  </Col>
                  <Col sm={6} md={3} className="mb-3">
                    <div className="stat-item">
                      <div className="stat-icon">⏱️</div>
                      <div className="stat-label">Avg Pace</div>
                      <div className="stat-number">{stats.averagePace}</div>
                    </div>
                  </Col>
                  <Col sm={6} md={3} className="mb-3">
                    <div className="stat-item">
                      <div className="stat-icon">✅</div>
                      <div className="stat-label">Runs Completed</div>
                      <div className="stat-number">{stats.runsCompleted}</div>
                    </div>
                  </Col>
                  <Col sm={6} md={3} className="mb-3">
                    <div className="stat-item">
                      <div className="stat-icon">❤️</div>
                      <div className="stat-label">Favorite Routes</div>
                      <div className="stat-number">{stats.favoriteRoutes}</div>
                    </div>
                  </Col>
                </Row>
                {userInfo.bio && (
                  <div className="profile-bio mt-3">
                    <strong>About me:</strong>
                    <p>{userInfo.bio}</p>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* My RSVPs Card */}
            <Card className="info-card mb-4">
              <Card.Header as="h5">
                My RSVPs 📋
                <Button 
                  variant="link" 
                  size="sm" 
                  className="ms-2 text-danger"
                  onClick={() => navigate('/events')}
                >
                  View All Events →
                </Button>
              </Card.Header>
              <Card.Body>
                {userRsvps.length === 0 ? (
                  <div className="text-center py-4">
                    <span className="empty-state-icon">📅</span>
                    <p>You haven't RSVP'd to any events yet.</p>
                    <Button variant="danger" size="sm" onClick={() => navigate('/events')}>
                      Browse Events
                    </Button>
                  </div>
                ) : (
                  userRsvps.map((rsvp) => {
                    const event = getEventDetails(rsvp.eventId);
                    return (
                      <div key={rsvp.id} className="event-item">
                        <div className="event-info">
                          <strong>{rsvp.eventName}</strong>
                          <div className="event-details">
                            <span>📅 {rsvp.eventDate}</span>
                            <span>⏰ {rsvp.eventTime}</span>
                            <span>📍 {rsvp.meetingPoint || 'Check event details'}</span>
                          </div>
                          {rsvp.notes && (
                            <div className="event-notes mt-1">
                              <small><em>Notes: {rsvp.notes}</em></small>
                            </div>
                          )}
                        </div>
                        <div className="event-status">
                          {getEventStatus(rsvp.eventDate)}
                        </div>
                      </div>
                    );
                  })
                )}
              </Card.Body>
            </Card>

            {/* Favorite Routes Card */}
            <Card className="info-card">
              <Card.Header as="h5">
                Favorite Routes ❤️
                <Button 
                  variant="link" 
                  size="sm" 
                  className="ms-2 text-danger"
                  onClick={() => navigate('/favorites')}
                >
                  View All →
                </Button>
              </Card.Header>
              <Card.Body>
                {userFavorites.length === 0 ? (
                  <div className="text-center py-4">
                    <span className="empty-state-icon">🗺️</span>
                    <p>You haven't added any favorite routes yet.</p>
                    <Button variant="danger" size="sm" onClick={() => navigate('/discover')}>
                      Discover Routes
                    </Button>
                  </div>
                ) : (
                  userFavorites.slice(0, 3).map((fav) => (
                    <div key={fav.id} className="favorite-item">
                      <div className="favorite-info">
                        <strong>{fav.routeName}</strong>
                        <div className="favorite-date">
                          Added {new Date(fav.addedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => navigate('/discover')}
                      >
                        View
                      </Button>
                    </div>
                  ))
                )}
                {userFavorites.length > 3 && (
                  <div className="text-center mt-2">
                    <small className="text-muted">
                      +{userFavorites.length - 3} more favorites
                    </small>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Edit Profile Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={tempUserInfo.name}
                onChange={(e) => setTempUserInfo({...tempUserInfo, name: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={tempUserInfo.email}
                disabled
              />
              <Form.Text className="text-muted">
                Email cannot be changed
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                value={tempUserInfo.location}
                onChange={(e) => setTempUserInfo({...tempUserInfo, location: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Preferred Pace</Form.Label>
              <Form.Control
                type="text"
                value={tempUserInfo.preferredPace}
                onChange={(e) => setTempUserInfo({...tempUserInfo, preferredPace: e.target.value})}
                placeholder="e.g., 9:30 /mi"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Bio</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={tempUserInfo.bio}
                onChange={(e) => setTempUserInfo({...tempUserInfo, bio: e.target.value})}
                placeholder="Tell us about yourself as a runner..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleSaveProfile}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ProfilePage;