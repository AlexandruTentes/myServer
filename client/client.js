const context = document.getElementById('canvas');
const ctx = canvas.getContext("2d");

let object_x = undefined;
let object_y = undefined;
let object_radius = undefined;
let object_socket = undefined;

window.onload = function()
{
    let socket = io.connect();

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    socket.emit('latency', Date.now(), function(start_time)
    {
        let latency = Date.now() - start_time;
        console.log(latency);
    })

    //draw current player
    socket.on('draw_this_player', function(data)
    {
        object_x = data.object_x;
        object_y = data.object_y;
        object_radius = data.object_radius;
        object_socket = data.object_socket;
        draw(data.object_x, data.object_y, data.object_radius, "red")
    });

    //draws all other players
    socket.on('draw_other_player', function(data){
        Object.keys(data).forEach(function(socket_id)
        {
            if(data[socket_id].object_socket != object_socket)
            {
                draw(data[socket_id].object_x, 
                     data[socket_id].object_y, data[socket_id].object_radius, "blue");
            }
        });
    });

    //delete disconnected player + refresh
    socket.on('disconnect_player', function(data){
        animate(data[0], data[1], data[2]);
    });

    //clear sockets on server closure
    socket.on('disconnect', function () {
        socket.emit('disconnect');
    });

    document.addEventListener('keypress', function(e)
    {
        if(e.code == "KeyW" || e.code == "KeyA"
            || e.code == "KeyS" || e.code == "KeyD")
            {
                socket.emit('clear_obj', [object_x, object_y, object_radius]);
                socket.emit('move_object', e.code);
            }

  	socket.emit('latency', Date.now(), function(start_time)
	{
	    let latency = Date.now() - start_time;
	    console.log(latency);
	});
    });

    document.addEventListener('keyup', function(e)
    {
        socket.emit('reset_velocity');
    });
    
    function draw(object_x, object_y, object_radius, color)
    {
        ctx.beginPath();
        ctx.arc(object_x, object_y, object_radius - 2, 0, Math.PI * 2, false);
        ctx.strokeStyle = color;
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.restore();
        ctx.stroke();
    }

    function animate(x, y, radius){
        //setting the frame rate (would have been better to manually set an interval rather than allowing the webpage to take as much fps as it would like)
        requestAnimationFrame(animate);
        
        //clearing the canvas every time a frame has passed;
        ctx.clearRect(x - radius, y - radius, 2 * radius, 2 * radius);
    }
}
