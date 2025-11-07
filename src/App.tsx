import { useRef, useEffect, useState } from "react";
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
  const [team, setTeam] = useState<Team>(null);
  
  const {me, dataStream, joinRoom, players}:any = useGameConnection();

  const meRef = useRef<any>(null);
  useEffect(() => { meRef.current = me; }, [me]);

  function receiver(msg:any) {
    if (msg.north!==undefined && jinei() === "south"){
      setNorthFormation(msg.north);
      console.log("north set")
      if (southFormation!==null){
	setPage("formation");
      }
    }
    if (msg.south!==undefined && jinei() === "north"){
      setSouthFormation(msg.south);
      console.log("south set")
      if (northFormation!==null){
	setPage("formation");
      }
    }
    console.log(meRef.current,jinei(),msg.north, msg.south);
  }
  

  // === 部隊編成完了時 ===
  const handleSetupComplete = (north: FormationInput, south: FormationInput) => {
    if (jinei() === "north"){
      setNorthFormation(north);
      console.log("north set")
      dataStream.write(JSON.stringify({north:north}))
      //if (southFormation){
	setPage("formation");
      //}
    }else{
      setSouthFormation(south);
      console.log("south set")
      dataStream.write(JSON.stringify({south:south}))
      //if (northFormation){
	setPage("formation");
      //}
    }
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
    if (meRef.current === null) return;
    if (meRef.current === undefined) return;
    if (meRef.current?.id === players[0]?.id){
      return("north")
    }else{
      return("south")
    }
  }

  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (me) return; // 二重join防止
    setLoading(true);
    try {
      await joinRoom(roomName, nickname, receiver);
    } finally {
      setLoading(false);
    }
  };

  if (me === null) {
    if (loading) return <div>接続中...</div>;
    return (
      <Stack direction="row">
	<Button variant="contained" onClick={handleJoin}>Join</Button>
	<TextField placeholder="room" onChange={(e)=>setRoomName(e.target.value)} />
	<TextField placeholder="nickname" onChange={(e)=>setNickname(e.target.value)} />
      </Stack>
    );
  }

  
  if (page === "setup") {
    return <>{me.id}<TeamSetupScreen team={jinei()} onComplete={handleSetupComplete} /></>;
  }

  //if (page === "formation" && northFormation && southFormation) {
  if (page === "formation") {
    return (
      <FormationSetupScreen
	team={jinei()}
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
