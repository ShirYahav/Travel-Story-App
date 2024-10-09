import React, { useState } from 'react';
import { Box, Button, TextField, Typography, createTheme, ThemeProvider } from '@mui/material';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { useUser } from '../../../Context/UserContext';

const theme = createTheme({
  palette: {
    primary: {
      main: "#B25E39",
    },
    secondary: {
      main: "#473D3A",
    },
    background: {
      default: "#f3f3f3",
    },
  },
  typography: {
    h3: {
      fontFamily: 'Georgia, "Times New Roman", Times, serif',
      marginTop: "50px",
      fontSize: "32px",
    },
    h6: {
      marginBottom: "20px",
    },
  },
});

const Login: React.FC = () => {

  const { setUser } = useUser();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', formData);
      const token = response.data;
      localStorage.setItem('token', token);

      const responseUser = await axios.get('http://localhost:3001/api/auth/me')
      setUser(responseUser.data.user);

      navigate('/');
    }
    catch (error) {
      console.error(error)
    }
  };

  return (
    <ThemeProvider theme={theme}>
    <Box>
      <Typography variant="h3" gutterBottom color="secondary">
        Login
      </Typography>
  
      <Box
        sx={{
          mb: 3,
          p: 2,
          border: '1px solid #ddd',
          borderRadius: '8px',
          width: {
            xs: '90%',
            sm: '45%',
            md: '30%',
          },
          margin: '0 auto',
          marginTop: '40px  ',
          position: 'relative',
        }}
      >
        <form onSubmit={handleSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            size='small'
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            variant="outlined"
            margin="normal"
            size='small'
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="secondary"
            style={{ marginTop: '20px' }}
          >
            Login
          </Button>
        </form>
      </Box>
    </Box>
    <Link to={'/register'} className='registerLink'>Don't have an account? Click here to register</Link>
    </ThemeProvider>
  );
  
};

export default Login;
