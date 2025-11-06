import { useState } from "react";
import TeamSetupScreen from "./TeamSetupScreen";
import FormationSetupScreen from "./FormationSetupScreen";
import GameScreen from "./GameScreen";
import type { FormationInput } from "./formationLogic";
import {useGameConnection} from "./hooks/useGameConnection";
import {Button, Stack, TextField} from '@mui/material';
import type {Team} from "./types";

export default function App() {
  const [page, setPage] = useState<"setup" | "formation" | "game">("setup");
  const [northFormation, setNorthFormation] = useState<FormationInput | null>(null);
  const [southFormation, setSouthFormation] = useState<FormationInput | null>(null);
  const [roomName, setRoomName] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  
  const {me,dataStream, joinRoom, players}:any = useGameConnection();

  function receiver(msg:any) {
    if (msg.north!==null){
      setNorthFormation(msg.north);
    }
    if (msg.south!==null){
      setSouthFormation(msg.south);
    }
    console.log(msg);
  }
  

  // === 部隊編成完了時 ===
  const handleSetupComplete = (north: FormationInput, south: FormationInput) => {
    if (jinei() === "north"){
      setNorthFormation(north);
      dataStream.write(JSON.stringify({north:north}))
    }else{
      setSouthFormation(south);
      dataStream.write(JSON.stringify({south:south}))
    }
    setPage("formation");
  };

  // === 配置完了時 ===
  const handleFormationComplete = (
    placedNorth: FormationInput,
    placedSouth: FormationInput
  ) => {
    if (jinei() == "north"){
      setNorthFormation(placedNorth);
      dataStream.write(JSON.stringify({north:placedNorth}))
    }else{
      setSouthFormation(placedSouth);
      dataStream.write(JSON.stringify({south:placedSouth}))
    }
    setPage("game");
  };

  function jinei(){
    if (me === null) return;
    if (me === undefined) return;
    if (me?.id === players[0]?.id){
      return("north")
    }else{
      return("south")
    }
  }
  
  if (me === null){
    return(
      (<Stack direction={"row"}>
         <Button variant='contained'
                 onClick={()=>{joinRoom(roomName,nickname,receiver)}}
         >Join</Button>
         <TextField placeholder='room'
                    onChange={(e)=>{setRoomName(e.target.value)}}
         ></TextField>
         <TextField  placeholder='nickname'
                     onChange={(e)=>{setNickname(e.target.value)}}
         ></TextField>
       </Stack>
      )
    )
  }
  
  if (page === "setup") {
    console.log(jinei());
    return <TeamSetupScreen team={jinei()} onComplete={handleSetupComplete} />;
  }

  if (page === "formation" && northFormation && southFormation) {
    return (
      <FormationSetupScreen
        northFormation={northFormation}
        southFormation={southFormation}
        onComplete={handleFormationComplete}
      />
    );
  }

  if (page === "game" && northFormation && southFormation) {
    return (
      <GameScreen
        northFormation={northFormation}
        southFormation={southFormation}
      />
    );
  }

  return null;
}
