import {firestore} from 'firebase-admin';
import {Request, Response} from 'express';

export const postMessage = async (req: Request, res: Response) => {
	console.log(req.body);
	const {params, query } = req.body;

	if( params.key == undefined || params.key.length <= 0){
		console.log('NONO');
		res.status(200).send({res:'get_NONO'});
		return;
	}

	if( query == 'get' ){

		//firestore().collection('items');


		/*firestore().collection('items').doc(params.key).listCollections().then(snapshot=>{
			snapshot.forEach(snaps => {
				console.log(snaps.id);
				//console.log(snaps);
			  //console.log(snaps["_queryOptions"].collectionId); // LIST OF ALL COLLECTIONS
			})
		})
		.catch(error => console.error(error));*/


		firestore().collection(`items/${params.key}/contents`).get().then(qsnap=>{
			const result:any = [];
			qsnap.forEach(doc=>{
				//console.log(doc.id, " => ", doc.data());
				const data = doc.data();
				data.did = doc.id;
				result.push( data );
			});
			res.status(200).send(JSON.stringify(result));
		}).catch(error=>{
			console.log("Error getting document:", error);
			res.status(400).send(error);
		});

		/*const docRef = firestore().collection('items').doc(params.key);
		docRef.get().then((doc) => {
			if (doc.exists) {
				console.log("Document data:", doc.data());
			} else {
				// doc.data() will be undefined in this case
				console.log("No such document!");
			}
		}).catch((error) => {
			console.log("Error getting document:", error);
		});
	
		//console.log(ref);
		res.status(200).send({res:'get_OKOK'});*/

	}else{
		// post

		const docRef = firestore().collection('items').doc(params.key).collection('contents');
		delete params.key;
		//await docRef.add(params);
		await docRef.doc(String(new Date().getTime())).set(params);
		res.status(200).send({res:'get_OKOK'});

	}

  //const {message} = req.query;

  

  //const message = req.body.params.data;

  /*console.log(req.query);
  console.log(message);*/
  

  /*const message = req.body.params.data;

  const ref = firestore().collection('message');
  await ref.add({message});
  res.status(200).send('message added????');*/

  /*const ref = firestore().collection('message').doc('test');
  await ref.add(req.body.params);
  res.status(200).send('message added');*/

  /*await ref.add({message});
  res.status(200).send('message added');*/
};
