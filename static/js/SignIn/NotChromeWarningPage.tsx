import React, {ReactElement} from 'react';
import Card from '@material-ui/core/Card/Card';
import Typography from '@material-ui/core/Typography/Typography';
export default function NotChromeWarningPage(): ReactElement {
    return (
        <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Card
                className='avo-card'
                style={{
                    marginTop: '180px',
                    marginBottom: '10%',
                    padding: '10px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    maxWidth: '50ch',
                }}
            >
                <Typography>
                    It looks like you are either not using Google Chrome or you are on your phone.
                    AVO is currently only optimized and tested for Chrome. We promise to work on
                    other browsers and have an awesome mobile app in the future, but for the time
                    being you will only be able to access AVO with Chrome.
                </Typography>
                <br />
                <br />
                <Typography>
                    You can download Chrome <a href='https://www.google.com/chrome/'>here</a>.
                </Typography>
                <Typography>
                    <a href='https://www.youtube.com/watch?v=EN9z1Y3_xXA'>Youtube video on how to install Chrome on Mac.</a>
                </Typography>
                <Typography>
                  <a href='https://www.youtube.com/watch?v=xiGC2I-qDgc&t=77s'>Youtube video on how to install Chrome on Windows.</a>
                </Typography>
            </Card>
        </div>
    );
}
