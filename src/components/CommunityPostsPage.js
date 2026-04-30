import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Form, Modal, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, where, orderBy, limit, getDocs as getDocsQuery, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import './CommunityPostsPage.css';

function CommunityPostsPage({ user }) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    eventId: '',
    eventName: '',
    postType: 'general'
  });
  const [commentText, setCommentText] = useState('');
  const [filterEvent, setFilterEvent] = useState('all');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [userLikes, setUserLikes] = useState({});

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const eventsSnapshot = await getDocs(collection(db, "events"));
      const eventsData = [];
      eventsSnapshot.forEach((doc) => {
        eventsData.push({ id: doc.id, ...doc.data() });
      });
      setEvents(eventsData);

      const postsSnapshot = await getDocs(query(collection(db, "posts"), orderBy("createdAt", "desc")));
      const postsData = [];
      postsSnapshot.forEach((doc) => {
        const postData = { id: doc.id, ...doc.data(), comments: doc.data().comments || [], likesList: doc.data().likesList || [] };
        postsData.push(postData);
      });
      setPosts(postsData);

      if (user) {
        const likesMap = {};
        postsData.forEach(post => {
          likesMap[post.id] = post.likesList?.includes(user.email) || false;
        });
        setUserLikes(likesMap);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!user) {
      alert("Please log in to create a post");
      return;
    }

    if (!newPost.title || !newPost.content) {
      alert("Please fill in title and content");
      return;
    }

    try {
      await addDoc(collection(db, "posts"), {
        userId: user.email,
        userName: user.name || user.email.split('@')[0],
        eventId: newPost.eventId || null,
        eventName: newPost.eventName || null,
        title: newPost.title,
        content: newPost.content,
        postType: newPost.postType,
        likes: 0,
        likesList: [],
        comments: [],
        createdAt: new Date().toISOString(),
        status: "active"
      });

      setShowCreateModal(false);
      setNewPost({ title: '', content: '', eventId: '', eventName: '', postType: 'general' });
      setSuccessMessage("✅ Post created successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      fetchData();
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post");
    }
  };

  const handleDeletePost = async () => {
    try {
      await deleteDoc(doc(db, "posts", selectedPost.id));
      setPosts(posts.filter(post => post.id !== selectedPost.id));
      setShowDeleteModal(false);
      setSelectedPost(null);
      setSuccessMessage("🗑️ Post deleted successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post");
    }
  };

  const handleLike = async (postId, currentLikes, isLiked) => {
    if (!user) {
      alert("Please log in to like posts");
      return;
    }

    try {
      const postRef = doc(db, "posts", postId);
      
      if (isLiked) {
        await updateDoc(postRef, {
          likes: increment(-1),
          likesList: arrayRemove(user.email)
        });
        setUserLikes(prev => ({ ...prev, [postId]: false }));
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, likes: currentLikes - 1, likesList: post.likesList?.filter(email => email !== user.email) || [] }
            : post
        ));
        setSuccessMessage("👍 Like removed!");
      } else {
        await updateDoc(postRef, {
          likes: increment(1),
          likesList: arrayUnion(user.email)
        });
        setUserLikes(prev => ({ ...prev, [postId]: true }));
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, likes: currentLikes + 1, likesList: [...(post.likesList || []), user.email] }
            : post
        ));
        setSuccessMessage("❤️ You liked this post!");
      }
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error("Error toggling like:", error);
      alert("Failed to update like");
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      const postRef = doc(db, "posts", selectedPost.id);
      await updateDoc(postRef, {
        comments: arrayUnion({
          userId: user.email,
          userName: user.name || user.email.split('@')[0],
          comment: commentText,
          timestamp: new Date().toISOString()
        })
      });

      const updatedPost = { ...selectedPost };
      updatedPost.comments = [...(selectedPost.comments || []), {
        userId: user.email,
        userName: user.name || user.email.split('@')[0],
        comment: commentText,
        timestamp: new Date().toISOString()
      }];
      setPosts(posts.map(post => 
        post.id === selectedPost.id ? updatedPost : post
      ));
      
      setCommentText('');
      setShowCommentModal(false);
      setSuccessMessage("💬 Comment added!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const getPostTypeBadge = (type) => {
    switch(type) {
      case 'looking_for_partner':
        return <Badge bg="info">👥 Looking for Partner</Badge>;
      case 'update':
        return <Badge bg="warning">📢 Update</Badge>;
      case 'question':
        return <Badge bg="secondary">❓ Question</Badge>;
      default:
        return <Badge bg="light" text="dark">💬 General</Badge>;
    }
  };

  const canDeletePost = (post) => {
    return user && post.userId === user.email;
  };

  const filteredPosts = filterEvent === 'all' 
    ? posts 
    : posts.filter(post => post.eventId === filterEvent);

  if (loading) {
    return (
      <div className="posts-loading">
        <Spinner animation="border" variant="danger" />
        <p>Loading community posts...</p>
      </div>
    );
  }

  return (
    <div className="community-posts-page">
      {showSuccess && (
        <div className="success-alert">
          {successMessage}
        </div>
      )}

      <div className="posts-hero">
        <Container>
          <h1>Community Posts 💬</h1>
          <p>Connect with other runners, share updates, and find running partners</p>
          <p className="text-light">Logged in as: <strong>{user?.email}</strong></p>
        </Container>
      </div>

      <Container className="mt-4 mb-5">
        <Row className="mb-4">
          <Col>
            <Button 
              variant="danger" 
              size="lg" 
              onClick={() => setShowCreateModal(true)}
              className="create-post-btn"
            >
              + Create New Post
            </Button>
          </Col>
          <Col md={4}>
            <Form.Select 
              value={filterEvent} 
              onChange={(e) => setFilterEvent(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Posts</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        {filteredPosts.length === 0 ? (
          <div className="no-posts">
            <span className="no-posts-icon">💬</span>
            <h3>No posts yet</h3>
            <p>Be the first to create a post and connect with other runners!</p>
            <Button variant="danger" onClick={() => setShowCreateModal(true)}>
              Create First Post
            </Button>
          </div>
        ) : (
          <Row>
            {filteredPosts.map((post) => (
              <Col md={6} lg={4} key={post.id} className="mb-4">
                <Card className="post-card">
                  <Card.Body>
                    <div className="post-header">
                      <div className="post-user">
                        <strong>{post.userName}</strong>
                        <small className="text-muted">
                          {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Just now'}
                        </small>
                      </div>
                      <div className="post-actions-header">
                        {getPostTypeBadge(post.postType)}
                        {canDeletePost(post) && (
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="delete-post-btn"
                            onClick={() => {
                              setSelectedPost(post);
                              setShowDeleteModal(true);
                            }}
                            title="Delete post"
                          >
                            🗑️
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <Card.Title className="mt-2">{post.title}</Card.Title>
                    <Card.Text>{post.content}</Card.Text>
                    
                    {post.eventName && (
                      <div className="post-event">
                        <Badge bg="outline-danger" className="event-badge">
                          📅 {post.eventName}
                        </Badge>
                      </div>
                    )}
                    
                    <div className="post-stats">
                      <Button 
                        variant="link" 
                        size="sm" 
                        onClick={() => handleLike(post.id, post.likes, userLikes[post.id])}
                        className={`like-btn ${userLikes[post.id] ? 'liked' : ''}`}
                      >
                        {userLikes[post.id] ? '❤️' : '🤍'} {post.likes || 0} Likes
                      </Button>
                      <Button 
                        variant="link" 
                        size="sm" 
                        onClick={() => {
                          setSelectedPost(post);
                          setShowCommentModal(true);
                        }}
                        className="comment-btn"
                      >
                        💬 {post.comments?.length || 0} Comments
                      </Button>
                    </div>

                    {post.comments && post.comments.length > 0 && (
                      <div className="post-comments-preview">
                        <hr />
                        <small><strong>Latest comment:</strong></small>
                        <p className="comment-preview">
                          {post.comments[post.comments.length - 1].comment}
                        </p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Create New Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Post Type</Form.Label>
              <Form.Select 
                value={newPost.postType}
                onChange={(e) => setNewPost({...newPost, postType: e.target.value})}
              >
                <option value="general">💬 General</option>
                <option value="looking_for_partner">👥 Looking for Running Partner</option>
                <option value="update">📢 Update about an event</option>
                <option value="question">❓ Question</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Related Event (Optional)</Form.Label>
              <Form.Select 
                value={newPost.eventId}
                onChange={(e) => {
                  const selectedEvent = events.find(ev => ev.id === e.target.value);
                  setNewPost({
                    ...newPost, 
                    eventId: e.target.value,
                    eventName: selectedEvent?.name || ''
                  });
                }}
              >
                <option value="">None</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>{event.name}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="What's this about?"
                value={newPost.title}
                onChange={(e) => setNewPost({...newPost, title: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={4}
                placeholder="Share your thoughts, questions, or plans..."
                value={newPost.content}
                onChange={(e) => setNewPost({...newPost, content: e.target.value})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleCreatePost}>
            Post
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this post?</p>
          <p><strong>"{selectedPost?.title}"</strong></p>
          <p className="text-danger">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeletePost}>
            Yes, Delete Post
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showCommentModal} onHide={() => setShowCommentModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Comments - {selectedPost?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="comments-section">
            {selectedPost?.comments?.length === 0 ? (
              <p className="text-muted text-center">No comments yet. Be the first!</p>
            ) : (
              selectedPost?.comments?.map((comment, idx) => (
                <div key={idx} className="comment-item">
                  <strong>{comment.userName}</strong>
                  <small className="text-muted ms-2">
                    {new Date(comment.timestamp).toLocaleDateString()}
                  </small>
                  <p className="mt-1 mb-0">{comment.comment}</p>
                </div>
              ))
            )}
          </div>
          
          <hr />
          
          <Form.Group className="mt-3">
            <Form.Label>Add a comment</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={2}
              placeholder="Share your thoughts..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCommentModal(false)}>
            Close
          </Button>
          <Button variant="danger" onClick={handleAddComment}>
            Post Comment
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default CommunityPostsPage;