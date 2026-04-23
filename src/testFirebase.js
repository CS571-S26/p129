import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

async function testFirebase() {
  console.log("🔍 Testing Firebase connection...");
  
  try {
    const querySnapshot = await getDocs(collection(db, "routes"));
    console.log(`✅ Found ${querySnapshot.size} routes in database!`);
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`📌 ${data.name} - ${data.distance} (${data.difficulty})`);
      console.log(`   Location: ${data.startLat}, ${data.startLng}`);
    });
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

export default testFirebase;