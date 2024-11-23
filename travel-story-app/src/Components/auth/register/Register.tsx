import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import axios from 'axios';
import { useUser } from '../../../Context/UserContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import config from '../../../Utils/Config';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#B25E39',
    },
    secondary: {
      main: '#473D3A',
    },
    background: {
      default: '#f3f3f3',
    },
  },
  typography: {
    h3: {
      fontFamily: 'Georgia, "Times New Roman", Times, serif',
      marginTop: '50px',
      fontSize: '32px',
    },
    h6: {
      marginBottom: '20px',
    },
  },
});

const Register: React.FC = () => {
  const { setUser } = useUser();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const validateName = (name: string): boolean => /^[a-zA-Z]+$/.test(name);

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
        case 'firstName':
        case 'lastName':
          if (!validateName(value)) {
            setErrors((prev) => ({
              ...prev,
              [name]: 'Invalid name',
            }));
          }
          break;
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

    const newErrors: FormData = { firstName: '', lastName: '', email: '', password: '' };
    let hasError = false;

    Object.entries(formData).forEach(([key, value]) => {
      if (value.trim() === '') {
        newErrors[key as keyof FormData] = 'This field is required';
        hasError = true;
      } else {
        switch (key) {
          case 'firstName':
          case 'lastName':
            if (!validateName(value)) {
              newErrors[key as keyof FormData] = 'Invalid name';
              hasError = true;
            }
            break;
          case 'email':
            if (!validateEmail(value)) {
              newErrors.email = 'Invalid address';
              hasError = true;
            }
            break;
          case 'password':
            if (!validatePassword(value)) {
              newErrors.password =
                'Invalid Password';
              hasError = true;
            }
            break;
          default:
            break;
        }
      }
    });
    setErrors(newErrors);

    if (hasError) return;

    try {
      const response = await axios.post(config.userRegisterUrl, formData);
      const token = response.data;
      localStorage.setItem('token', token);

      const responseUser = await axios.get(config.userValidationUrl);
      setUser(responseUser.data.user);

      toast.success('You are registered :)');
      navigate('/');
    } catch (error) {
      toast.error('Something went wrong');
      console.error(error);
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
              id="firstName"
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              error={Boolean(errors.firstName)}
              helperText={errors.firstName}
            />
            <TextField
              variant="outlined"
              margin="normal"
              size="small"
              fullWidth
              id="lastName"
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              error={Boolean(errors.lastName)}
              helperText={errors.lastName}
            />
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
              Register
            </Button>
          </form>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Register;
