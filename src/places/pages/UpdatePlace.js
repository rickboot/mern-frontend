import React, { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import { useForm } from '../../shared/hooks/form-hook';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { VALIDATOR_REQUIRE, VALIDATOR_MINLENGTH } from '../../shared/util/validators';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../user/context/auth-context';
import './PlaceForm.css';

// import DUMMY_DATA from '../../shared/util/DUMMY.DATA';

const UpdatePlace = () => {
  const auth = useContext(AuthContext);
  const {sendRequest, isLoading, error, clearError} = useHttpClient();
  const [loadedPlace, setLoadedPlace] = useState();
  const history = useHistory();
  const placeId = useParams().placeId;

  const [formState, inputHandler, setFormData] = useForm(
    {
      title: {
        value: '',
        isValid: false,
      },
      description: {
        value: '',
        isValid: false,
      },
    },
    true
  );

  useEffect(() => {
    try {
      const fetchPlace = async () => {
        const responseData = await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/places/${placeId}`);
        setLoadedPlace(responseData.place);
        setFormData(
          {
            title: {
              value: responseData.place.title,
              isValid: true,
            },
            description: {
              value: responseData.place.description,
              isValid: true,
            },
          },
          true
        );
      }
      fetchPlace();
    } catch (err) {}
  }, [sendRequest, placeId, setFormData]);

  if (isLoading)
    return (
      <div className='center'>
        <Card>
          <LoadingSpinner />
        </Card>
      </div>
    );

  if (!loadedPlace && !error)
    return (
      <div className='center'>
        <Card>
          <h2>Could not find place!</h2>
        </Card>
      </div>
    );

  const submitHandler = async (event) => {
    event.preventDefault();

    const { title, description } = formState.inputs;

    try {
      await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/places/${placeId}`, 
        { method: 'PATCH',
          body: JSON.stringify({
            title: title.value, 
            description: description.value, 
          }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + auth.token 
          }
        }
      );
      
      history.push(`/${auth.userId}/places`);
    } catch (err) {}

  };


  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      { !isLoading && loadedPlace && <form className='place-form' onSubmit={submitHandler}> 
        <Input
          id='title'
          element='input'
          type='text'
          label='Title'
          validators={[VALIDATOR_REQUIRE()]}
          errorText='Enter valid title'
          onInput={inputHandler}
          initialValue={loadedPlace.title}
          initialIsValid={true}
          />
        <Input
          id='description'
          element='input'
          type='textarea'
          label='Description'
          validators={[VALIDATOR_MINLENGTH(5)]}
          errorText='Enter valid description'
          onInput={inputHandler}
          initialValue={loadedPlace.description}
          initialIsValid={true}
          />
        <Button type='sumbit' disabled={!formState.isValid}>
          UPDATE PLACE
        </Button>
      </form> 
      }
    </React.Fragment>
  );
};

export default UpdatePlace;
