import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ServerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [server, setServer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
};

export default ServerDetails;
