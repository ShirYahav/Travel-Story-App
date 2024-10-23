import React, { useState } from 'react';
import { Box, Button, TextField, Typography, createTheme, ThemeProvider } from '@mui/material';
import axios from 'axios';
import { useUser } from '../../../Context/UserContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import config from '../../../Utils/Config';

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

const Register: React.FC = () => {

  const { setUser } = useUser();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(config.userRegisterUrl, formData);
      const token = response.data;
      localStorage.setItem('token', token);

      const responseUser = await axios.get(config.userValidationUrl)
      setUser(responseUser.data.user);

      toast.success('You are registered :)')
      navigate('/');
    }
    catch (error) {
      toast.error('Something went wrong')
      console.error(error)
    }
  };

  return (
    <ThemeProvider theme={theme}>
    <Box>
      <Typography variant="h3" gutterBottom color="secondary">
        Register
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
            md: '38%',
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
            id="firstName"
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />
          <TextField
            variant="outlined"
            margin="normal"
            size='small'
            required
            fullWidth
            id="lastName"
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />
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
            Register
          </Button>
        </form>
      </Box>
    </Box>
    </ThemeProvider>
  );
  
};

export default Register;
