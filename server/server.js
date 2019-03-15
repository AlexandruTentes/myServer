let express = require('express');
let app = express();
let socket = require('socket.io');
let data = {};
let radius;
let objX;
let objY;
let max_vel = 5;
let velocity = max_vel;
let speed = 1.05;

app.use(express.static('\client'));

let server = app.listen(4000, function()
{
    console.log("Listening to port: " + server.address().port);
});

let io = socket(server);

io.on('connect', function(socket)
{
    console.log("connected");

    objX = Math.floor(Math.random() * (500 - radius * 2) + radius);
    objY = Math.floor(Math.random() * (500 - radius * 2) + radius);
    radius = 20;

    if(data)
    {
        Object.keys(data).forEach(function(id)
        {
            if(getDist(objX, objY, data[id].object_x, data[id].object_y)
                - radius - data[id].object_radius < 0)
            {
                objX = Math.floor(Math.random() * (500 - radius * 2) + radius);
                objY = Math.floor(Math.random() * (500 - radius * 2) + radius);
            }
        });
    }

    data[socket.id] = 
    {
        object_x: objX,
        object_y: objY,
        object_radius: radius,
        object_socket: socket.id
    }

    socket.emit('draw_this_player', data[socket.id]);
    socket.emit('draw_other_player', data);
    socket.broadcast.emit('draw_other_player', data);

    socket.on('player_coords', function(data)
    {
        io.sockets.emit('player_coords', data);
    });

    socket.on('move_object', function(key)
    {
        if(key == "KeyW")
            data[socket.id].object_y -= velocity; 
        if(key == "KeyA")
            data[socket.id].object_x -= velocity; 
        if(key == "KeyS")
            data[socket.id].object_y += velocity; 
        if(key == "KeyD")
            data[socket.id].object_x += velocity;

        velocity *= speed;
            
        socket.emit('draw_this_player', data[socket.id]);
        socket.emit('draw_other_player', data);
        socket.broadcast.emit('draw_other_player', data);
    });

    socket.on('clear_obj', function(obj)
    {
        socket.emit('disconnect_player', obj);
        socket.broadcast.emit('disconnect_player', obj);
    });

    socket.on('reset_velocity', function()
    {
        velocity = max_vel;
    });

    socket.on('disconnect', function()
    {
        console.log("disconnect");
        let old_player_x = data[socket.id].object_x;
        let old_player_y = data[socket.id].object_y;
        let old_player_radius = data[socket.id].object_radius;
        delete data[socket.id];
        io.emit('disconnect_player', [old_player_x, old_player_y, old_player_radius]);
    });
});

function getDist(obj1X, obj1Y, obj2X, obj2Y){
    let deltaX = obj1X - obj2X;
    let deltaY = obj1Y - obj2Y;
    
    return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
}