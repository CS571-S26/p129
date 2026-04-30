import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, updateDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import './ProfilePage.css';

function ProfilePage({ user }) {
  const navigate = useNavigate();
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
    joinDate: ''
  });
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    location: 'Madison, WI',
    preferredPace: '9:30 /mi',
    bio: 'Passionate runner exploring Madison trails!'
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [tempUserInfo, setTempUserInfo] = useState(userInfo);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const userDocRef = doc(db, "users", user.email);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserInfo({
          name: userData.name || user.email.split('@')[0],
          email: user.email,
          location: userData.location || 'Madison, WI',
          preferredPace: userData.preferredPace || '9:30 /mi',
          bio: userData.bio || 'Passionate runner exploring Madison trails!'
        });
        setStats(prev => ({
          ...prev,
          averagePace: userData.preferredPace || '9:30 /mi',
          joinDate: userData.joinDate || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        }));
        setIsNewUser(false);
      } else {
        const newUserData = {
          name: user.name || user.email.split('@')[0],
          email: user.email,
          location: 'Madison, WI',
          preferredPace: '9:30 /mi',
          bio: 'Passionate runner exploring Madison trails!',
          joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, newUserData);
        setUserInfo({
          name: newUserData.name,
          email: user.email,
          location: newUserData.location,
          preferredPace: newUserData.preferredPace,
          bio: newUserData.bio
        });
        setStats(prev => ({
          ...prev,
          averagePace: newUserData.preferredPace,
          joinDate: newUserData.joinDate
        }));
        setIsNewUser(true);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      setUserInfo({
        name: user?.name || user?.email?.split('@')[0] || 'Runner',
        email: user?.email || '',
        location: 'Madison, WI',
        preferredPace: '9:30 /mi',
        bio: 'Passionate runner exploring Madison trails!'
      });
    }
  };

  const saveUserProfile = async () => {
    try {
      const userDocRef = doc(db, "users", user.email);
      await updateDoc(userDocRef, {
        name: tempUserInfo.name,
        location: tempUserInfo.location,
        preferredPace: tempUserInfo.preferredPace,
        bio: tempUserInfo.bio,
        updatedAt: new Date().toISOString()
      });
      
      setUserInfo(tempUserInfo);
      setStats(prev => ({
        ...prev,
        averagePace: tempUserInfo.preferredPace
      }));
      setShowEditModal(false);
      
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    }
  };

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const rsvpQuery = query(collection(db, "rsvps"), where("userId", "==", user.email));
      const rsvpSnapshot = await getDocs(rsvpQuery);
      const rsvpData = [];
      rsvpSnapshot.forEach((doc) => {
        rsvpData.push({ id: doc.id, ...doc.data() });
      });
      setUserRsvps(rsvpData);

      const eventsSnapshot = await getDocs(collection(db, "events"));
      const eventsData = [];
      eventsSnapshot.forEach((doc) => {
        eventsData.push({ id: doc.id, ...doc.data() });
      });
      setEvents(eventsData);

      const favQuery = query(collection(db, "favorites"), where("userId", "==", user.email));
      const favSnapshot = await getDocs(favQuery);
      const favData = [];
      favSnapshot.forEach((doc) => {
        favData.push({ id: doc.id, ...doc.data() });
      });
      setUserFavorites(favData);

      let totalMiles = 0;
      rsvpData.forEach(rsvp => {
        const miles = parseFloat(rsvp.routeDistance) || 0;
        totalMiles += miles;
      });

      setStats(prev => ({
        ...prev,
        totalMiles: totalMiles.toFixed(1),
        runsCompleted: rsvpData.length,
        favoriteRoutes: favData.length,
        eventsJoined: rsvpData.length
      }));

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

          <Col lg={8} md={12}>
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
          <Button variant="danger" onClick={saveUserProfile}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ProfilePage;