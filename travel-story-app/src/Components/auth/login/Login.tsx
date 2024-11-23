import React, { useState } from 'react';
import { Box, Button, TextField, Typography, createTheme, ThemeProvider } from '@mui/material';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { useUser } from '../../../Context/UserContext';
import toast from 'react-hot-toast';
import config from '../../../Utils/Config';

interface FormData {
  email: string;
  password: string;
}

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

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<FormData>({
    email: '',
    password: '',
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean =>
    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (value.trim() === '') {
      setErrors((prev) => ({
        ...prev,
        [name]: 'This field is required',
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));

      switch (name) {
        case 'email':
          if (!validateEmail(value)) {
            setErrors((prev) => ({
              ...prev,
              email: 'Invalid email address',
            }));
          }
          break;
        case 'password':
          if (!validatePassword(value)) {
            setErrors((prev) => ({
              ...prev,
              password:
                'Password must be at least 8 characters long and include letters and numbers',
            }));
          }
          break;
        default:
          break;
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let hasError = false;
    const newErrors: FormData = { email: '', password: '' };

    if (formData.email.trim() === '') {
      newErrors.email = 'This field is required';
      hasError = true;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email address';
      hasError = true;
    }

    if (formData.password.trim() === '') {
      newErrors.password = 'This field is required';
      hasError = true;
    } else if (!validatePassword(formData.password)) {
      newErrors.password =
        'Password must be at least 8 characters long and include letters and numbers';
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) return;

    try {
      const response = await axios.post(config.userLoginUrl, formData);
      const token = response.data;
      localStorage.setItem('token', token);

      const responseUser = await axios.get(config.userValidationUrl);
      setUser(responseUser.data.user);

      toast.success('You are logged in');
      navigate('/');
    } catch (error) {
      toast.error('Wrong email or password');
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
            marginTop: '40px',
            position: 'relative',
          }}
        >
          <form onSubmit={handleSubmit}>
            <TextField
              variant="outlined"
              margin="normal"
              size="small"
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={Boolean(errors.email)}
              helperText={errors.email}
            />
            <TextField
              variant="outlined"
              margin="normal"
              size="small"
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              error={Boolean(errors.password)}
              helperText={errors.password}
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
      <Link to={'/register'} className="registerLink">
        Don't have an account? Click here to register
      </Link>
    </ThemeProvider>
  );
};

export default Login;
