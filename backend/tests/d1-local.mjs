import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
// Real SQLite, with a small adapter for the documented D1 binding boundary.
export function database(filename=':memory:'){
 const db=new DatabaseSync(filename);db.exec('PRAGMA foreign_keys=ON');
 db.exec(readFileSync(new URL('../migrations/0001_customer_data.sql',import.meta.url),'utf8'));
 function prepare(sql,args=[]){return {bind(...values){return prepare(sql,values)},async first(){return db.prepare(sql).get(...args)??null},async all(){return {success:true,results:db.prepare(sql).all(...args)}},async run(){const r=db.prepare(sql).run(...args);return {success:true,meta:{changes:Number(r.changes)}}},sql,args};}
 return {prepare,async batch(statements){db.exec('BEGIN');try{const r=[];for(const s of statements)r.push(await s.run());db.exec('COMMIT');return r}catch(e){db.exec('ROLLBACK');throw e}},close:()=>db.close(),raw:db};
}
