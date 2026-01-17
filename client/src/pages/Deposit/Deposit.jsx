import React from "react";
import useAuth from "../../hook/useAuth";

const Deposit = () => {
  const { user } = useAuth();
  console.log("Current User:", user);
  return <div>Deposit Page</div>;
};

export default Deposit;
