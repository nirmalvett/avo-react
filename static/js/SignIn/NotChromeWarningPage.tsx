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
                    It looks like you are not using Google Chrome. AVO is currently only optimized
                    and tested for Chrome. We promise to work on other browsers in the future, but
                    for the time being you will only be able to access AVO with Chrome.
                </Typography>
                <br />
                <br />
                <Typography>
                    You can download Chrome <a href='https://www.google.com/chrome/'>here</a>.
                </Typography>
            </Card>
        </div>
    );
}
