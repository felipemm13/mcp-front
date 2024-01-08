import { firestore } from "./firebaseConfig";

class FirebaseService {
  constructor() {
    this.firestore = firestore;
  }

  async getIdsStudySportGroup(email) {
    let sportsGroup = [];
    const query = await this.firestore
      .collection("Users")
      .doc(email)
      .collection("studySportGroup")
      .get();
    query.forEach(function (childSnapshot) {
      sportsGroup.push(childSnapshot.id);
    });
    return sportsGroup;
  }

  async getSportsPersonIdByIdGroup(idArray) {
    let sportsPersons = [];
    const query = await firestore
      .collection("SportsPerson")
      .where("IdGroup", "in", idArray)
      .get();
    query.forEach((doc) => {
      sportsPersons.push({ id: doc.id, ...doc.data() });
    });
    return sportsPersons;
  }

  async getAllSessionFromUser(sport, email) {
    let allSessions = [];

    try {
      // Get IDs of Study Sport Groups associated with the user
      const groupIds = await this.getIdsStudySportGroup(email);

      // Get Sports Person IDs associated with these groups
      const sportsPersonIds = await this.getSportsPersonIdByIdGroup(groupIds);

      // Fetch sessions for each sports person
      for (const sportsPersonId of sportsPersonIds) {
        const querySnapshot = await firestore
          .collection("Session")
          .doc(sport)
          .collection("SportPerson")
          .doc(sportsPersonId.id)
          .collection("DateTime")
          .get();

        for (const doc of querySnapshot.docs) {
          const sessionData = doc.data();
          const annotationsSnapshot = await firestore
            .collection("Session")
            .doc(sport)
            .collection("SportPerson")
            .doc(sportsPersonId.id)
            .collection("DateTime")
            .doc(doc.id)
            .collection("SessionAnnotations")
            .doc("annotations")
            .get();

          allSessions.push({
            ...sessionData,
            annotations: annotationsSnapshot.data(),
            sessionId: doc.id,
            sportsPersonId: sportsPersonId.id,
          });
        }
      }
    } catch (error) {
      throw error;
    }

    return allSessions;
  }
  
  async getPlays(owner, all = true) {
    let plays = [];
    try {
      const collectionRef = firestore
        .collection("Plays")
        .doc(owner)
        .collection("Movements");
      const querySnapshot = all
        ? await collectionRef.get()
        : await collectionRef.where("enabled", "==", true).get();

      querySnapshot.forEach((doc) => {
        plays.push({ id: doc.id, ...doc.data() });
      });

      // Sort the plays by id (assuming the id is numeric)
      plays.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    } catch (error) {
      throw error; // Error handling
    }
    return plays;
  }

  updateUserCalibration = async (email, hcalib, wcalib, H, img) => {
    await this.firestore
      .collection("Users")
      .doc(email)
      .collection("ControlCamera")
      .doc("Homography")
      .set({
        Hcalib: hcalib,
        Wcalib: wcalib,
        Homography: H,
        backgroundImage: img,
      });
  };

  getStudySportGroupByEmail = async (email, sport) => {
    let sportsGroup = [];
    var query = await this.firestore
      .collection("Users")
      .doc(email)
      .collection("studySportGroup")
      .where("Sport", "==", sport)
      .get();
    query.forEach(function (childSnapshot) {
      var Key = childSnapshot.id;
      var childData = childSnapshot.data();
      sportsGroup.push([Key, childData]);
    });
    return sportsGroup;
  };

  getIdsStudySportGroup = async (email) => {
    let sportsGroup = [];
    var query = await this.firestore
      .collection("Users")
      .doc(email)
      .collection("studySportGroup")
      .get();
    query.forEach(function (childSnapshot) {
      sportsGroup.push(childSnapshot.id);
    });
    return sportsGroup;
  };

  getSportsPersonByIdGroup = async (id) => {
    let sportsGroup = [];
    var query = await this.firestore
      .collection("SportsPerson")
      .where("IdGroup", "==", id)
      .get();
    query.forEach(function (childSnapshot) {
      var Key = childSnapshot.id;
      var childData = childSnapshot.data();
      sportsGroup.push([Key, childData]);
    });
    return sportsGroup;
  };
}

export default new FirebaseService();
