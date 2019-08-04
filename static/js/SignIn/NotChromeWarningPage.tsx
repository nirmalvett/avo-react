import React, {Component, ReactElement} from 'react';
import Card from '@material-ui/core/Card/Card';
import Grid from '@material-ui/core/Grid/Grid';
import Typography from '@material-ui/core/Typography/Typography';
export default function NotChromeWarningPage(): ReactElement {
    return (
        <Grid
            container
            spacing={8}
            style={{flex: 1, display: 'flex', paddingBottom: 0, justifyContent: 'center'}}
        >
            <Grid item xs={4} style={{flex: 1, display: 'flex'}}>
                <div style={{paddingTop: '180px'}}>
                    <Card
                        className='avo-card'
                        style={{
                            marginBottom: '10%',
                            padding: '10px',
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Typography>
                            Oops it looks like you are not using Google Chrome. AVO is currently
                            only optimized and tested for Chrome. We promise to work on the other
                            browsers in the future, but for the time being you will only be able to
                            access AVO with Chrome.
                        </Typography>
                        <br />
                        <br />
                        <Typography>
                            To download Chrome{' '}
                            <a href='https://www.google.com/chrome/'>click here</a>
                        </Typography>
                    </Card>
                </div>
            </Grid>
        </Grid>
    );
}
