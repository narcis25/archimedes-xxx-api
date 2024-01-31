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

		firestore().collection(`history/${params.key}/contents`).get().then(qsnap=>{
			const result:any = [];
			qsnap.forEach(doc=>{
				const data = doc.data();
				data.did = doc.id;
				result.push( data );
			});
			res.status(200).send(JSON.stringify(result));
		}).catch(error=>{
			console.log("Error getting document:", error);
			res.status(400).send(error);
		});
	}else if( query == 'post' ){
		if( params.data.i_item.length <= 0 ){
			res.status(400).send({error:'공백으로 추가할 수 없습니다.'});
			return;
		}

		const docRef = firestore().collection('history').doc(params.key).collection('contents');
		await docRef.doc(String(new Date().getTime())).set(params.data);
		res.status(200).send({res:'get_OKOK'});


	}else if( query == 'remove' ){

	}else if( query == 'edit' ){
		if( params.data.i_item.length <= 0 ){
			res.status(400).send({error:'공백으로 추가할 수 없습니다.'});
			return;
		}
	}
};
