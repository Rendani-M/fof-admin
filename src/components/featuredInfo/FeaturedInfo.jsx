import "./featuredInfo.css";
import { Box, CircularProgress, LinearProgress, Typography } from "@mui/material";

export default function FeaturedInfo({progress, title, date, data}) {
  
  // const [progress, setProgress] = useState(0);
  function CircularProgressWithLabel(props) {
    return (
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress variant="determinate" {...props} />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" component="div" color="text.secondary">
            {`${Math.round(props.value)}%`}
          </Typography>
        </Box>
      </Box>
    );
  }

  CircularProgressWithLabel.propTypes = {
    /**
     * The value of the progress indicator for the determinate variant.
     * Value between 0 and 100.
     * @default 0
     */
    value: progress,
  };

  return (
    <Box className="featuredItem" sx={{width:{xs:'70%', sm: '70%', md:'70%'}, border:'1px solid blue', background:'white'}}>
      <Box className="left">
        <Typography component='span' sx={{ 
          fontSize:'20px',
          color:'blue'
        }}>{date}</Typography>
        <div className="featuredMoneyContainer">
          <Typography component='span' sx={{ 
            fontSize:'30px',
            fontWeight:600
           }}>{title}</Typography>
        </div>
        <Box sx={{ display:{xs:'block', sm:'block', md:'none'}, mb:'0.5em' }}>
          <LinearProgress variant="determinate" value={progress} />
          <span>{progress}% Completed</span>
        </Box>
        <Typography component='span' sx={{ 
          fontSize:'15px',
          color:'gray'
          }}>Amount: {data}</Typography>
      </Box>
      <Box className="right" sx={{ display:{xs:'none', sm:'none', md:'flex'} }}>
        <CircularProgressWithLabel value={progress} style={{ transform: 'scale(3)' }}/>
      </Box>
    </Box>
  );
}
