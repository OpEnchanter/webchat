import asyncio, websockets, random

# Server variables
active_connections = {}; active_codes = [["", "pblc"]]; clients = []; connection_types=["Msg", "NewSrv", "Connect", "PubSrv"]
# Security Variables
code_length = 6


# Generate a code that will correspond to a user
def generateCode():
    global code_length
    alphabet="abcdefghijklmnopqrstuvwxyz"
    while True:
        code = ""
        for x in range(code_length): code += random.choice(alphabet+alphabet.upper()+'0123456789')
        if not code in active_codes: break
    return(code)

def findNested(list:list, value):
    trying = 0
    for x in list:
        if value in x:
            trying+=1
    if trying>=1:
        return (True)
    else:
        return (False)


def findNestedLoc(list:list, value):
    for x in range(len(list)):
        if value in list[x]:
            return(x)
        
def getAllNested(list:list, value):
    output = []
    for x in range(len(list)):
        if value in list[x]:
            output.append(x)
    return(output)


async def websocket_handler(websocket, path):
    target_ip = None  # Declare the variable outside the if condition
    
    while True:
        data = await websocket.recv()
        parseData = data.split("Ø")
        print(parseData)
        if parseData[0] in connection_types:  
            
            if parseData[0] == "Connect":
                # Connection Type (Connect To Room) Ø Room ID Ø Username
                print(f"{parseData[2]} is trying to connect to room {parseData[1]}")
                if findNested(active_codes, parseData[1]):
                    print("Server: "+parseData[1]+" exists")
                    clients.append([str(generateCode()), websocket, parseData[2], parseData[1]])
                    await websocket.send("Joined "+parseData[1])
                else:
                    print("Server: "+parseData[1]+" does not exist")

                
            elif parseData[0] == "NewSrv":
                # Connection Type (Connect To Room) Ø Room To Connect To
                ID = str(generateCode())
                active_codes.append([ID, websocket])

                await websocket.send(f"IDØ{ID}")
                
                print(active_codes)


                print()

            elif parseData[0] == "Msg":
                try:
                    # Connection Type (Send Message) Ø Message Ø Room ID
                    clientsInRoom = getAllNested(clients, parseData[2])
                    print(clientsInRoom)
                    for x in range(len(clientsInRoom)):
                        await sendMSG(clients[clientsInRoom[x]][1], parseData[1])
                    await sendMSG(active_codes[findNestedLoc(active_codes, parseData[2])][1], parseData[1])
                    print(f"Sent Data to room {parseData[2]}")
                except Exception as e:
                    print(f"Data send failed: {e}")

            elif parseData[0] == "PubSrv":
                try:
                    active_codes.append[parseData[1], "pblc"]
                    await websocket.send("SrvStrt")
                    print("New public server started")
                except Exception as e:
                    print(f"Error: {e}")
                
        else:
            print("Invalid Connection Type")



async def sendMSG(ws_obj, message):
    if not ws_obj == "pblc":
        try:
            websocket = ws_obj
            await websocket.send(message)
            print(f"Sent data successfully.")
        except:
            print(f"No active connection found on WebSocket Object: {ws_obj}")
        




if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    server = websockets.serve(websocket_handler, '0.0.0.0', 8765)
    loop.run_until_complete(server)
    loop.run_forever()
