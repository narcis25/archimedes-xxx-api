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

		/*async function post(){
			const docRef = firestore().collection('items').doc(params.key).collection('contents');
			await docRef.doc(String(new Date().getTime())).set(params.data).then(()=>{
				res.status(200).send({res:'get_OKOK'});
			});
		}

		firestore().collection(`items/${params.key}/contents`)
		.where("col", "==", `${params.data.col}`)
		.get()
		.then((querySnapshot)=>{
			params.data.ord = String(querySnapshot.size);
			post();
		});*/

		if( params.data.name.length <= 0 ){
			res.status(400).send({error:'공백으로 추가할 수 없습니다.'});
			return;
		}
		

		const docRef = firestore().collection('items').doc(params.key).collection('contents');
		docRef
		.where("col", "==", params.data.col)
		.where("name", "==", params.data.name)
		.where("type", "==", params.data.type)
		.get()
		.then(querySnapshot=>{
			if( querySnapshot.size == 0 ){
				// 값 넣는 것이 가능..

				async function post(){
					const docRef = firestore().collection('items').doc(params.key).collection('contents');
					await docRef.doc(String(new Date().getTime())).set(params.data).then(()=>{
						res.status(200).send({res:'get_OKOK'});
					});
				}

				firestore().collection(`items/${params.key}/contents`)
				.where("col", "==", params.data.col)
				.get()
				.then((querySnapshot)=>{
					params.data.ord = String(querySnapshot.size);
					post();
				});
			}else{
				res.status(400).send({error:'동일한 항목이 이미 존재합니다.'});
			}
		});

	}else if( query == 'remove' ){
		/*firestore().collection(`items/${params.key}/contents`).doc(`${params.data.did}`).delete().then(()=>{
			res.status(200).send({res:'removeOK'});
		}).catch((error)=>{
			res.status(400).send(error);
		});*/

		
		const docRef = firestore().collection(`items/${params.key}/contents`).doc(`${params.data.did}`);
		docRef.get().then(doc=>{
			const data:any = doc.data();
			const type = data.col;
			docRef.delete().then(()=>{

				firestore().collection(`items/${params.key}/contents`)
				.where("col", "==", type)
				.orderBy("ord")
				.get()
				.then((querySnapshot)=>{
					async function process(){
						let ord:number = 0;
						for( const doc of querySnapshot.docs ){
							//console.log('arrange', doc.data());
							if( doc.data().ord != ord ){
								await doc.ref.update({ord:`${ord}`});
							}
							ord++;
						}
						res.status(200).send({res:'OKOK'});
					}

					process();
				});
			});			
		});


	}else if( query == 'switch' ){
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
			async function process(){
				let ord:number = 0;

				for( const doc of querySnapshot.docs ){
					ord = Number(doc.data().ord);
					if( tgt_ord == ord ){
						await doc.ref.update({ord:`${tgt_index}`});
					}else{
						if( tgt_ord < tgt_index){
							if( tgt_ord <= ord && ord <= tgt_index ){
								if( tgt_index >= ord ){
									await doc.ref.update({ord:`${ord-1}`});
								}
							}
						}else{
							if( tgt_index <= ord && ord <= tgt_ord ){
								await doc.ref.update({ord:`${ord+1}`});
							}
						}
					}
				}
				res.status(200).send({res:'OKOK'});
			}
			process();
			/*let ord:number = 0;
			let ok_cnt = 0;
			let size:number = querySnapshot.size;
			if( tgt_ord < tgt_index ) {
				querySnapshot.forEach( doc=>{
					ord = Number(doc.data().ord);
					if( tgt_ord <= ord && ord <= tgt_index ){
						if( tgt_ord == ord ){
							doc.ref.update({ord:`${tgt_index}`}).then(()=>{
								ok_cnt++;
								if( ok_cnt == size ){
									res.status(200).send({res:'OKOK'});
								}
							});
						}else if( tgt_index >= ord ){
							doc.ref.update({ord:`${ord-1}`}).then(()=>{
								ok_cnt++;
								if( ok_cnt == size ){
									res.status(200).send({res:'OKOK'});
								}
							});
						}
					}else{
						ok_cnt++;
						if( ok_cnt == size ){
							res.status(200).send({res:'OKOK'});
						}
					}
				});
			}else{
				querySnapshot.forEach(doc=>{
					ord = Number(doc.data().ord);
					if( tgt_index <= ord && ord <= tgt_ord ){
						if( tgt_ord == ord ){
							doc.ref.update({ord:`${tgt_index}`}).then(()=>{
								ok_cnt++;
								if( ok_cnt == size ){
									res.status(200).send({res:'OKOK'});
								}
							});
						}else{
							doc.ref.update({ord:`${ord+1}`}).then(()=>{
								ok_cnt++;
								if( ok_cnt == size ){
									res.status(200).send({res:'OKOK'});
								}
							});
						}
					}else{
						ok_cnt++;
						if( ok_cnt == size ){
							res.status(200).send({res:'OKOK'});
						}
					}
				});
			}*/
			
		});
	}else if( query == 'arrange'){
		console.log('arrange!!!');
		firestore().collection(`items/${params.key}/contents`)
		.where("col", "==", `${params.data.type}`)
		.orderBy("ord")
		.get()
		.then((querySnapshot)=>{

			async function process(){
				let ord:number = 0;
				for( const doc of querySnapshot.docs ){
					console.log('arrange', doc.data());
					await doc.ref.update({ord:`${ord}`});
					ord++;
				}
				res.status(200).send({res:'OKOK'});
			}

			process();

			/*let ord:number = 0;
			let ok_cnt = 0;
			let size:number = querySnapshot.size;
			querySnapshot.forEach(doc=>{
				console.log('arrange', doc.data());
				doc.ref.update({ord:`${ord}`}).then(()=>{
					ok_cnt++;
					if( ok_cnt == size ){
						res.status(200).send({res:'OKOK'});
					}
				})
				ord++;
			});*/

			


		});
	}else if( query == 'edit' ){
		if( params.data.name.length <= 0 ){
			res.status(400).send({error:'공백으로 추가할 수 없습니다.'});
			return;
		}

		const docRef = firestore().collection('items').doc(params.key).collection('contents');
		docRef
		.where("col", "==", params.data.col)
		.where("name", "==", params.data.name)
		.where("type", "==", params.data.type)
		/*.where("ord", "!=", params.data.ord)*/
		.get()
		.then(querySnapshot=>{
			if( querySnapshot.size == 0 ){
				// 값 넣는 것이 가능..
				async function action(){
					const ref = firestore().collection(`items/${params.key}/contents`).doc(`${params.data.did}`);
					await ref.set(params.data);
					res.status(200).send({res:'OKOK'});
				}
				action();
			}else{
				res.status(400).send({error:'동일한 항목이 이미 존재합니다.'});
			}
		});


		/*const ref = firestore().collection(`items/${params.key}/contents`).doc(`${params.data.did}`);
		await ref.set(params.data);
		res.status(200).send({res:'OKOK'});*/
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
