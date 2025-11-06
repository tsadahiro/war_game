import { useState } from "react";
import TeamSetupScreen from "./TeamSetupScreen";
import FormationSetupScreen from "./FormationSetupScreen";
import GameScreen from "./GameScreen";
import type { FormationInput } from "./formationLogic";
import {useGameConnection} from "./hooks/useGameConnection";
import {Button, Stack, TextField} from '@mui/material';

export default function App() {
  const [page, setPage] = useState<"setup" | "formation" | "game">("setup");
  const [northFormation, setNorthFormation] = useState<FormationInput | null>(null);
  const [southFormation, setSouthFormation] = useState<FormationInput | null>(null);
  const [roomName, setRoomName] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  
  const {me,dataStream, joinRoom, players}:any = useGameConnection();

  function receiver(msg:any) {
    console.log(msg);
  }
  

  // === 部隊編成完了時 ===
  const handleSetupComplete = (north: FormationInput, south: FormationInput) => {
    setNorthFormation(north);
    setSouthFormation(south);
    setPage("formation");
  };

  // === 配置完了時 ===
  const handleFormationComplete = (
    placedNorth: FormationInput,
    placedSouth: FormationInput
  ) => {
    setNorthFormation(placedNorth);
    setSouthFormation(placedSouth);
    setPage("game");
  };

  function jinei(){
    if (me === null) return;
    if (me === undefined) return;
    if (me?.id === players[0]?.id){
      return("kita")
    }else{
      return("minami")
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
    return <TeamSetupScreen onComplete={handleSetupComplete} />;
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
