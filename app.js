require(`events`).EventEmitter.defaultMaxListeners = Infinity;
const app      = require(`express`)();
const server   = require(`http`).Server(app);
const io       = require(`socket.io`)(server);
const cpuUsage = require(`cpu-usage`);
const os       = require(`os`);
const ds       = require('fd-diskspace');

var cpu,
	current_ram,
	total_ram,
	free_ram,
	uptime,
	disk,
	dp,
	disk_total,
	disk_free,
	disk_available,
	disk_percentage,
	all_disks,
	hostname;



io.on('connection', function (socket) {
	hostname     = os.hostname();
	total_ram    = (os.totalmem() / (1024 * 1024)).toFixed(); //la ram total se envía solo una vez, por lo tanto está fuera del intervalo
	
	socket.emit('hostname', hostname);	
	socket.emit('total_ram', total_ram); // ram total (correcto)
	disk = "/";

	cpuUsage(function( load ) { // intervalo de 1 segundo que realiza cpuUsage por si mismo el cual aprovechamos para emitir los demas datos

		ds.diskSpace(function(err, res){
	    if(err) throw err;
	    all_disks = res.disks;
	    
	    disk_percentage = (res.disks[disk].percent * 100).toFixed(1); 
	 	dp = {disk, disk_percentage};
	 	/*
	    console.log(res.disks['/'].free);
	    console.log(res.disks['/'].size);
	    console.log(res.disks['/'].used);
	    console.log((res.disks['/'].percent * 100).toFixed(2));
		*/
		});
		

		free_ram	 = (os.freemem() / (1024*1024)).toFixed(); //ram libre incorrecta (reparar)
		current_ram  = total_ram - free_ram; //ram actual incorrecta (reparar)
		freememp     = (current_ram / 100).toFixed(); //ram porcentaje incorrecto (reparar)

		socket.emit('current_cpu', load); // porcentaje de uso de cpu (correcto)
		socket.emit('current_ram', current_ram);
    	socket.emit('current_ram_percentage', freememp);
		socket.emit('uptime', os.uptime()); // fidelidad del uptime del servidor  (por determinar)
		socket.emit('disk_percentage', dp);
		socket.emit('all_disks', all_disks);
	});  
});
//console.log("Free RAM (mb): " + (os.freemem()/1024)/1024);

//console.log("Total RAM (mb): " + (os.totalmem()/1024)/1024);

server.listen(3000);
