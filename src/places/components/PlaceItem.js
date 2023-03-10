import React, { useState, useContext } from 'react';
import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import Modal from '../../shared/components/UIElements/Modal';
import Map from '../../shared/components/UIElements/Map';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../user/context/auth-context';

import './PlaceItem.css';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

const PlaceItem = (props) => {
  const auth = useContext(AuthContext);
  const {sendRequest, isLoading, error, clearError } = useHttpClient();
  const [showMap, setShowMap] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const openMapHandler = () => setShowMap(true);
  const closeMapHandler = () => setShowMap(false);

  const openDeleteHandler = () => setShowConfirmDelete(true);
  const cancelDeleteHandler = () => setShowConfirmDelete(false);

  const confirmDeleteHandler = async () => {
    setShowConfirmDelete(false);
    
    try {
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/places/${props.id}`, 
        { method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + auth.token } 
        });
      props.onDelete(props.id);
    } catch (err) {}
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />

      <Modal
        show={showMap}
        onCancel={closeMapHandler}
        header={props.address}
        contentClass='place-item__modal-content'
        footerClass='place-item__footer-actions'
        footer={<Button onClick={closeMapHandler}>CLOSE</Button>}
      >
        <div className='map-container'>
          <Map center={props.coordinates} zoom={16} />
        </div>
      </Modal>

      <Modal
        show={showConfirmDelete}
        onCancel={cancelDeleteHandler}
        header='Delete Place'
        footerClass='place-item__modal-actions'
        footer={
          <React.Fragment>
            <Button onClick={cancelDeleteHandler} inverse>CANCEL</Button>
            <Button onClick={confirmDeleteHandler} danger>DELETE</Button>
          </React.Fragment>
        }
      >
        <p>Are you sure? Deleted places cannot be undeleted.</p>
      </Modal>

      <li className='place-item'>
        <Card>
          {isLoading && <LoadingSpinner asOverlay />}
          <div className='place-item__image'>
            <img src={`${process.env.REACT_APP_ASSET_URL}/${props.image}`} alt={props.title} />
          </div>
          <div className='place-item__info'>
            <h2>{props.title}</h2>
            <h3>{props.address}</h3>
            <p>{props.description}</p>
          </div>
          <div className='place-item__actions'>
            <Button inverse onClick={openMapHandler}>
              VIEW ON MAP
            </Button>
            {auth.userId === props.creatorId && <Button to={`/places/${props.id}`}>EDIT</Button>}
            {auth.userId === props.creatorId && <Button onClick={openDeleteHandler} danger>DELETE</Button>} 
          </div>
        </Card>
      </li>
    </React.Fragment>
  );
};

export default PlaceItem;
