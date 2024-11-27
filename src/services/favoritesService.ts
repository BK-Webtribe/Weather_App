import { firebaseApp } from './firebase';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { collection, getDocs } from 'firebase/firestore';


const db = getFirestore(firebaseApp);

export const saveFavoriteLocation = async (userId: string, location: string) => {
    const favoriteRef = doc(db, 'users', userId, 'favorites', location);
    await setDoc(favoriteRef, { timestamp: new Date() }); // Add metadata if needed
  };

export const getFavoriteLocations = async (userId: string) => {
    const favoritesCollectionRef = collection(db, 'users', userId, 'favorites');
    const querySnapshot = await getDocs(favoritesCollectionRef);
  
    // Map over the documents to extract location names
    const locations = querySnapshot.docs.map((doc) => doc.id); // Use the document ID as the location name
    return locations; // Return an array of locations
  };
