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

	}else if( query == 'post' ){
		// post
		/*const docRef = firestore().collection('items').doc(params.key).collection('contents');
		await docRef.doc(String(new Date().getTime())).set(params.data);
		res.status(200).send({res:'get_OKOK'});*/

		async function post(){
			const docRef = firestore().collection('items').doc(params.key).collection('contents');
			await docRef.doc(String(new Date().getTime())).set(params.data);
			res.status(200).send({res:'get_OKOK'});
		}

		firestore().collection(`items/${params.key}/contents`)
		.where("col", "==", `${params.data.col}`)
		.get()
		.then((querySnapshot)=>{
			params.data.ord = String(querySnapshot.size);
			post();
		});

	}else if( query == 'remove' ){
		firestore().collection(`items/${params.key}/contents`).doc(`${params.data.did}`).delete().then(()=>{
			res.status(200).send({res:'removeOK'});
		}).catch((error)=>{
			res.status(400).send(error);
		});
	}else if( query == 'switch' ){
		/*const ords:string[] = [];
		params.data.tgt.forEach( (el:string)=>{
			ords.push(el);
		});

		firestore().collection(`items/${params.key}/contents`)
		.where("col", "==", `${params.data.type}`)
		.where("ord", "in", ords)
		.get()
		.then((querySnapshot)=>{
			querySnapshot.forEach(doc=>{
				const ori_ord:string = doc.data().ord;
				const result:string[] = ords.filter(item => item !== ori_ord);
				doc.ref.update({ord:`${result[0]}`});
				//doc.data().update();
				//console.log(doc.id, "qqqq => ", doc.data());
			});
			res.status(200).send({res:'OKOK'});
		})*/

		const tgt_ord:number = params.data.tgt[0];
		const tgt_index:number = params.data.tgt[1];

		if( tgt_ord == tgt_index ){
			res.status(200).send({res:'OKOK'});
			return;
		}

		firestore().collection(`items/${params.key}/contents`)
		.where("col", "==", `${params.data.type}`)
		.orderBy("ord")
		.get()
		.then((querySnapshot)=>{
			let ord:number = 0;
			if( tgt_ord < tgt_index ) {
				console.log('aaa');
				querySnapshot.forEach(doc=>{
					ord = Number(doc.data().ord);
					if( tgt_ord <= ord && ord <= tgt_index ){
						if( tgt_ord == ord ){
							doc.ref.update({ord:`${tgt_index}`});
							console.log('ttt', ord, ':', tgt_index);
						}else if( tgt_index >= ord ){
							doc.ref.update({ord:`${ord-1}`});
							console.log('set', ord, ':', ord-1);
						}
					}
				});
			}else{
				querySnapshot.forEach(doc=>{
					ord = Number(doc.data().ord);
					if( tgt_index <= ord && ord <= tgt_ord ){
						if( tgt_ord == ord ){
							doc.ref.update({ord:`${tgt_index}`});
							console.log('ppp', ord, ':', tgt_index);
						}else{
							doc.ref.update({ord:`${ord+1}`});
							console.log('pset', ord, ':', ord+1);
						}
					}

					/*if( tgt_ord == ord ){
						doc.ref.update({ord:`${tgt_index}`});
						console.log('ppp', ord, ':', tgt_index);
					}else if( tgt_index <= ord && tgt_ord <= ord){
						doc.ref.update({ord:`${ord+1}`});
						console.log('pset', ord, ':', ord+1);
					}*/
				});
			}

			/*querySnapshot.forEach(doc=>{
				if( tgt_ord == Number(doc.data().ord) ){
					doc.ref.update({ord:`${tgt_index}`});
				}else if( tgt_index >= Number(doc.data().ord) ){
					doc.ref.update({ord:`${ord+1}`});
				}
				ord++;
			});*/
			res.status(200).send({res:'OKOK'});
		});
	}else if( query == 'arrange'){
		console.log('arrange!!!');
		firestore().collection(`items/${params.key}/contents`)
		.where("col", "==", `${params.data.type}`)
		.orderBy("ord")
		.get()
		.then((querySnapshot)=>{
			let ord:number = 0;
			querySnapshot.forEach(doc=>{
				console.log('arrange', doc.data());
				doc.ref.update({ord:`${ord}`});
				ord++;
			});
			res.status(200).send({res:'OKOK'});
		});
	}else if( query == 'edit' ){
		const ref = firestore().collection(`items/${params.key}/contents`).doc(`${params.did}`);
		await ref.set(params.data);
		res.status(200).send({res:'OKOK'});
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
