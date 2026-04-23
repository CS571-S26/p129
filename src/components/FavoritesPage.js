import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import './FavoritesPage.css';

function FavoritesPage({ user }) {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const q = query(collection(db, "favorites"), where("userId", "==", user.email));
      const querySnapshot = await getDocs(q);
      const favoritesData = [];
      for (const doc of querySnapshot.docs) {
        const favData = doc.data();
        const routeQuery = query(collection(db, "routes"), where("name", "==", favData.routeName));
        const routeSnapshot = await getDocs(routeQuery);
        routeSnapshot.forEach((routeDoc) => {
          favoritesData.push({ 
            id: routeDoc.id, 
            favoriteId: doc.id,
            ...routeDoc.data(),
            ...favData
          });
        });
      }
      setFavorites(favoritesData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      setLoading(false);
    }
  };

  const removeFromFavorites = async (favoriteId, routeName) => {
    try {
      await deleteDoc(doc(db, "favorites", favoriteId));
      setFavorites(favorites.filter(fav => fav.favoriteId !== favoriteId));
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  const getDifficultyBadge = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return <Badge bg="success">Easy</Badge>;
      case 'Moderate': return <Badge bg="warning">Moderate</Badge>;
      case 'Hard': return <Badge bg="danger">Hard</Badge>;
      default: return <Badge bg="secondary">{difficulty}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="favorites-loading">
        <Spinner animation="border" variant="danger" />
        <p>Loading your favorites...</p>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <div className="favorites-hero">
        <Container>
          <h1>My Favorite Routes ❤️</h1>
          <p>Your saved running routes in Madison</p>
          <p className="text-light">Logged in as: <strong>{user?.email}</strong></p>
        </Container>
      </div>

      <Container className="mt-4 mb-5">
        {favorites.length === 0 ? (
          <div className="no-favorites">
            <span className="no-favorites-icon">🗺️</span>
            <h3>No favorites yet</h3>
            <p>Go to Discover Routes and click "Add to Favorites" to save your favorite running paths!</p>
            <Button variant="danger" onClick={() => navigate('/discover')}>Discover Routes</Button>
          </div>
        ) : (
          <Row>
            {favorites.map((route) => (
              <Col md={6} lg={4} key={route.id} className="mb-4">
                <Card className="favorite-card">
                  <Card.Body>
                    <div className="favorite-card-header">
                      <Card.Title>{route.name}</Card.Title>
                      {getDifficultyBadge(route.difficulty)}
                    </div>
                    <div className="favorite-stats">
                      <span>📏 {route.distance}</span>
                      <span>⛰️ {route.elevation}</span>
                      <span>⏱️ {route.estimatedTime}</span>
                    </div>
                    <div className="favorite-terrain">
                      <small>🛤️ {route.terrain}</small>
                    </div>
                    <Card.Text className="mt-3">
                      {route.description?.substring(0, 100)}...
                    </Card.Text>
                    <div className="favorite-actions">
                      <Button variant="outline-danger" size="sm" onClick={() => removeFromFavorites(route.favoriteId, route.name)}>
                        Remove
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => navigate('/discover')}>
                        View on Map
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

export default FavoritesPage;