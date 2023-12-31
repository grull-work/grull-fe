/* eslint-disable */
import React, {useState, useEffect} from 'react';
import EditProfileCard from './EditProfileCard';
import ProfileDetails from './ProfileDetails';
import AuthService from '../../Services/AuthService';
import fetchMeData from '../../Services/User';
import FreelancerEmptyProfile from '../FreelancerEmptyProfile/FreelancerEmptyProfile';
import { useNavigate } from 'react-router-dom';
import AddTokenModal from '../../utils/AddTokenModal';
import { openNotificationWithIcon } from '../../utils/openNotificationWithIcon';
import emailjs from "@emailjs/browser";
import config from 'react-global-configuration';
const EditProfile = ({userMode, setUserMode}) => {
  const [meData, setMeData] = useState({});
  const [profileEditMode, setProfileEditMode] = useState(false);
  const navigate = useNavigate();
  const [tokenmodalopen,setTokenModalOpen] = useState(false);
  const isEmailJsServiceEnabled = config.get('EMAILJS_SERVICE_ENABLED');
  useEffect(() => {
    fetchMeData()
        .then((fetchedData) => {
          setMeData(fetchedData);
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
        });
  }, []);
  const handleTokenModalClose=()=>{
    setTokenModalOpen(false);
  }
  const handleOpenTokenModal=()=>{
    setTokenModalOpen(true);
  }
  useEffect(() => {
    if (!isEmailJsServiceEnabled) {
      console.warn(
        "Email JS service is not enabled on this environment. " +
        "Please set `REACT_APP_EMAILJS_SERVICE_ENABLED` environment variable to allow it to initialize."
      );
      return;
    }

    emailjs.init(config.get('EMAILJS_USER_ID'));
  }, []);
  const onOk=(selectedvalue)=>{
    if (!isEmailJsServiceEnabled) {
      openNotificationWithIcon('error',"Balance request email failed!");
      console.warn(
        "Email JS service is not enabled on this environment. Email has not been sent." +
        "Please set `REACT_APP_EMAILJS_SERVICE_ENABLED` environment variable to allow it to send emails."
      );
      return;
    }

    const serviceId = config.get('EMAILJS_SERVICE_ID');
    const templateId = config.get('EMAILJS_TEMPLATE_ID');
    const templateParams = {
      from_name: meData.first_name,
      message:`Please add ${selectedvalue} to my wallet balance with id ${meData.id}`,
    };
    emailjs.send(serviceId, templateId, templateParams)
      .then((response) => {
        openNotificationWithIcon('success',"Balance request sent successfully");
      })
      .catch((error) => {
        openNotificationWithIcon('error',"Something went wrong");
      });
  }
  const handleUserModeChange = () => {
    AuthService.toggleUserMode();
    setUserMode(AuthService.getUserMode());
  };
  return (
    <div className="flex flex-col md:flex-row justify-center md:space-x-20 bg-[#1A0142] 2xl:h-[913px] pt-10">
      {!profileEditMode?<>
        <EditProfileCard
          isEmployerProfile={userMode === AuthService.EMPLOYER_MODE}
          userMode={userMode}
          meData={meData}
          setProfileEditMode={()=>setProfileEditMode(true)}
        />
        <ProfileDetails
          meData={meData}
          userMode={userMode}
        />
      </>:
      <>
        <FreelancerEmptyProfile userData={meData} setUserData={setMeData} editingDisable={()=>setProfileEditMode(false)} editProfile={true} profileImg={`https://ui-avatars.com/api/?name=${meData['first_name']}+${meData['last_name']}`}/>
      </>}

      <div className="flex flex-col items-center  sm:space-y-10 text-white space-x-4 pt-8">
        <div className="flex flex-col space-y-4   font-spaceGrotesk font-semibold text-xl">
          {/* <button className="sm:px-8 sm:py-4  text-center p-2 rounded shadow bg-gradient-to-l from-purple-400 to-transparent" onClick = {()=> { !AuthService.isFreelancer()?navigate('/myjobs'):null }}>
            {AuthService.isFreelancer() ? 'Find Jobs': 'Manage Jobs'}
          </button> */}
          <p onClick={handleUserModeChange} className="text-purple-600 text-base font-spaceGrotesk font-medium cursor-pointer">
            {AuthService.isFreelancer() ? 'SWITCH TO EMPLOYER' : 'SWITCH TO FREELANCER'}
            
          </p>
          <p  className="text-purple-600 text-base font-spaceGrotesk font-medium cursor-pointer" onClick={handleOpenTokenModal}>
          {!AuthService.isFreelancer() && 'REQUEST WALLET BALANCE'}
          </p>
          <AddTokenModal visible={tokenmodalopen} onCancel={handleTokenModalClose} onOk={onOk}/>
        </div>
      </div>

    </div>


  );
};


export default EditProfile;
