import React, { useState, useContext } from 'react';
import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import Input from '../../shared/components/FormElements/Input';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';
import { VALIDATOR_EMAIL, VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../context/auth-context';
import './Auth.css';
import '../../shared/components/UIElements/Card.css';

const Authenticate = () => {
  const auth = useContext(AuthContext);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const {isLoading, sendRequest, error, clearError } = useHttpClient();

  const [formState, inputHandler, setFormData] = useForm(
    {
      email: {
        value: '',
        isValid: false,
      },
      password: {
        value: '',
        isValid: false,
      },
    },
    false
  );

  const switchModeHandler = () => {

    // log in user
    if (!isLoginMode) {
      setFormData(
        {
          ...formState.inputs,
          name: undefined,
          image: undefined,
        },
        formState.inputs.email.isValid && formState.inputs.password.isValid
      );
    } else {

      // sign up user
      setFormData(
        {
          ...formState.inputs,
          name: {
            value: '',
            isValid: false,
          },
          image: {
            value: null,
            isValid: false,
          },
        },
      );
    }

    setIsLoginMode((prevMode) => !prevMode);
  };

  const authSubmitHandler = async (event) => {
    event.preventDefault();

    // log in user
    if (isLoginMode) {
      try {
        const responseData = await sendRequest(process.env.REACT_APP_BACKEND_URL + '/users/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formState.inputs.email.value,
            password: formState.inputs.password.value
          }),
        });
        auth.login(responseData.userId, responseData.token);
      } catch (err) {
      }

    // sign up user
    } else {
      try {
        const formData = new FormData();
        formData.append('name', formState.inputs.name.value);
        formData.append('email', formState.inputs.email.value);
        formData.append('password', formState.inputs.password.value);
        formData.append('image', formState.inputs.image.value); // image key set in backend with multer
        
        const responseData = await sendRequest(
          process.env.REACT_APP_BACKEND_URL + '/users/signup', {
          method: 'POST',
          body: formData,
        });

        auth.login(responseData.userId, responseData.token);
      } catch (err) {
      }

    }
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <Card className='authentication'>
        {isLoading && <LoadingSpinner asOverlay />}
        <h2>{isLoginMode ? 'Login Required' : 'Sign Up'}</h2>
        <hr />
        <form className='' onSubmit={authSubmitHandler}>
          {!isLoginMode && (
            <Input
              id='name'
              element='input'
              type='text'
              label='Name'
              validators={[VALIDATOR_REQUIRE()]}
              errorText='Please enter your name'
              onInput={inputHandler}
            />
          )}

          {!isLoginMode && (
            <ImageUpload 
              id="image" 
              center 
              onInput={inputHandler} 
              errorText="Please add an image."
            />
          )}

          <Input
            id='email'
            element='input'
            type='text'
            label='Email'
            validators={[VALIDATOR_EMAIL()]}
            errorText='Invalid email'
            onInput={inputHandler}
          />

          <Input
            id='password'
            element='input'
            type='password'
            label='Password'
            validators={[VALIDATOR_MINLENGTH(8)]}
            errorText='Enter a password of 8 or more characters'
            onInput={inputHandler}
          />
          
          <Button type='submit' disabled={!formState.isValid}>
            {isLoginMode ? 'LOGIN' : 'SIGNUP'}
          </Button>
        </form>
        <Button inverse onClick={switchModeHandler}>
          Switch Login/Signup
        </Button>
      </Card>
    </React.Fragment>
  );
};


export default Authenticate;