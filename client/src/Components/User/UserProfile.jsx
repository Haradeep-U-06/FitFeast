import { useContext ,useState, useEffect} from 'react'
import { userContextObj } from '../../Contexts/UserContext'
import { useForm} from "react-hook-form";
import axios from 'axios'
import { getBaseUrl } from '../../utils/config'
import './UserProfile.css'

function UserProfile() {
  const {currentUser , setCurrentUser}=useContext(userContextObj)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const [gen, setGender] = useState("");
  useEffect(() => {
    if (currentUser?.gender) {
      setGender(currentUser.gender);
    }
  }, [currentUser]);
  function handleChange(event){
     setGender(event.target.value)
  }

  async function adddetails(newuser) {
    // Determine gender correctly
    newuser.gender = gen;

    try {
      // Check if user exists in DB
      const rep1 = await axios.get(`${getBaseUrl()}/user-api/users/${newuser.email}`);
      
      if (rep1.data.message === "User Not Found") {
          // If user does not exist, create a new user
          await axios.post(`${getBaseUrl()}/user-api/users`, {...currentUser,height: Number(newuser.height),age: Number(newuser.age),weight: Number(newuser.weight),desiredweight: Number(newuser.desiredweight),gender: newuser.gender});
      } else {
          // If user exists, update user details
          await axios.put(`${getBaseUrl()}/user-api/users/${rep1.data.payload._id}`,{...currentUser,height: Number(newuser.height),age: Number(newuser.age),weight: Number(newuser.weight),desiredweight: Number(newuser.desiredweight),gender: newuser.gender});
      }

      // Fetch updated user data
      const rep2 = await axios.get(`${getBaseUrl()}/user-api/users/${newuser.email}`);
      setCurrentUser(rep2.data.payload)

      // console.log("Updated User Data:", currentUser);
     } catch (error) {
      console.error("Error updating user:", error);
    }
 }

  return (
    <div className="form">
    <form onSubmit={handleSubmit(adddetails)}>
      <div className="firstname">
        <label htmlFor="firstName" className="form-label">
          FirstName
        </label>
        <input defaultValue={currentUser.firstName}
          type="text"
          {...register("firstName", {
            required: true,
            minLength: 4,
            maxLength: 20,
          })}
          id="firstName"
          className="form-control"
        disabled/>
      </div>
      <div className="lastname">
      <label htmlFor="lastName" className="form-label">
          LastName
        </label>
        <input defaultValue={currentUser.lastName}
          type="text"
          {...register("lastName", {
            required: true,
            minLength: 4,
            maxLength: 20,
          })}
          id="lastName"
          className="form-control"
        />
      </div>
      <div className="email">
      <label htmlFor="email" className="form-label">
          Email
        </label>
        <input defaultValue={currentUser.email}
          type="text"
          {...register("email")}
          id="email"
          className="form-control"
        disabled/>
      </div>
      <div className='gender'>
      <label className="form-label">
          Gender
        </label>
          <div className="form-check">
            <input 
              className="form-check-input" 
              type="radio" 
              name="gender" 
              onChange={handleChange} 
              value="Male" 
              checked={gen === "Male"} 
            />
            <label className="form-check-label">
              Male
            </label>
          </div>
          <div className="form-check">
            <input 
              className="form-check-input" 
              type="radio" 
              name="gender" 
              onChange={handleChange} 
              value="Female" 
              checked={gen === "Female"} 
            />
            <label className="form-check-label">
              Female
            </label>
          </div>  
          </div>
      <div className='age'>
        <label htmlFor="age" className="form-label">Age</label>
        <input defaultValue={currentUser.age} type="number" {...register("age")} id="age" className="form-control"/>
      </div>
      <div className='height'>
      <label htmlFor="height" className="form-label">Height</label>
      <input defaultValue={currentUser.height} type="number" {...register("height")} id="height" className="form-control" />
      </div>
      <div className='weight'>
      <label htmlFor="weight" className="form-label">Weight</label>
      <input  defaultValue={currentUser.weight} type="number" {...register("weight")} id="weight" className="form-control"/>
      </div>
      <div className='desiredweight'>
      <label htmlFor="desiredweight" className="form-label">Desired Weight</label>
      <input  defaultValue={currentUser.desiredweight} type="number" {...register("desiredweight")} id="desiredweight" className="form-control"/>
      </div>

      <button type="submit" className="btn btn-success">
        Edit
      </button>
    </form>
  </div>
  )
}

export default UserProfile