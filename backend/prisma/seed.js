import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
const crops = [{name:'Rice'},{name:'Wheat'},{name:'Maize'},{name:'Paddy'}];
const districts=['Muzaffarpur','Patna','Darbhanga','Vaishali'];
async function main(){
 await prisma.payment.deleteMany(); await prisma.cropQuality.deleteMany(); await prisma.weight.deleteMany(); await prisma.procurementRequest.deleteMany(); await prisma.notification.deleteMany(); await prisma.farmerCrop.deleteMany(); await prisma.land.deleteMany(); await prisma.mSPRate.deleteMany(); await prisma.crop.deleteMany(); await prisma.farmer.deleteMany(); await prisma.user.deleteMany(); await prisma.procurementCentre.deleteMany();
 const cropRows={}; for(const c of crops) cropRows[c.name]=await prisma.crop.create({data:c});
 for(const [name,rate] of Object.entries({Rice:2300,Wheat:2275,Maize:2225,Paddy:2300})) await prisma.mSPRate.create({data:{cropId:cropRows[name].id,season:'Kharif',rate,effectiveDate:new Date()}});
 const centres={}; for(const d of districts) centres[d]=await prisma.procurementCentre.create({data:{centreId:`KS-${d.slice(0,3).toUpperCase()}`,name:`${d} Procurement Centre`,district:d,state:'Bihar',village:`${d} Village`,address:`Main Market, ${d}`,latitude:25.6,longitude:85.1,capacity:5000}});
 for(let i=0;i<10;i++){const district=districts[i%4]; const password=await bcrypt.hash(i===0?'Farmer@123':`Farmer@${String(i+1).padStart(3,'0')}`,10); const user=await prisma.user.create({data:{name:`Demo Farmer ${i+1}`,mobile:`99999999${String(91+i).slice(-2)}`,password,role:'FARMER'}}); const farmer=await prisma.farmer.create({data:{farmerId:`KS-F-${String(i+1).padStart(4,'0')}`,village:`Village ${i+1}`,district,state:'Bihar',landArea:5+i,userId:user.id}}); await prisma.land.create({data:{surveyNumber:`SUR-${1000+i}`,area:5+i,village:farmer.village,district,ownershipType:'Owned',farmerId:farmer.id}}); const crop=cropRows[i%2?'Wheat':'Rice']; await prisma.farmerCrop.create({data:{acreage:2+i%3,estimatedQuantity:30+i*2,season:'Kharif',farmerId:farmer.id,cropId:crop.id}}); await prisma.notification.create({data:{title:'Welcome to Kisaan Setu',message:'Your farmer profile is ready.',farmerId:farmer.id}}); }
 for(const [mobile,name,role,password] of [['9999999992','Procurement Operator','PROCUREMENT_OPERATOR','Operator@123'],['9999999993','Administrator','ADMIN','Admin@123']]) await prisma.user.create({data:{name,mobile,role,password:await bcrypt.hash(password,10)}});
 console.log('Seed complete'); }
main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
