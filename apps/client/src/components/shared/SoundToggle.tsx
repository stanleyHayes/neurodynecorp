import { Box, Tooltip, IconButton } from "@mui/material";
import VolumeUpOutlinedIcon from "@mui/icons-material/VolumeUpOutlined";
import VolumeOffOutlinedIcon from "@mui/icons-material/VolumeOffOutlined";
import { useSound, useSoundEnabled } from "@/hooks/useSound";

export default function SoundToggle() {
  const { enabled, toggle } = useSoundEnabled();
  // Mount the global listener so playSound() events from other components work
  useSound();
  return (
    <Tooltip title={enabled ? "Mute sound" : "Enable sound"} placement="left">
      <Box
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 100,
        }}
      >
        <IconButton
          onClick={toggle}
          sx={{
            width: 40,
            height: 40,
            border: "1px solid rgba(108,99,255,0.2)",
            bgcolor: "rgba(10,14,26,0.8)",
            backdropFilter: "blur(8px)",
            color: enabled ? "#6C63FF" : "text.secondary",
            transition: "all 0.2s",
            "&:hover": {
              borderColor: "rgba(108,99,255,0.4)",
              bgcolor: "rgba(10,14,26,0.9)",
              boxShadow: enabled ? "0 0 16px rgba(108,99,255,0.3)" : "none",
            },
          }}
        >
          {enabled ? <VolumeUpOutlinedIcon sx={{ fontSize: 18 }} /> : <VolumeOffOutlinedIcon sx={{ fontSize: 18 }} />}
        </IconButton>
      </Box>
    </Tooltip>
  );
}
