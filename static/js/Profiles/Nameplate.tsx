import * as React from 'react';
import {Profile} from 'Http/types';
import {Typography, Link} from '@material-ui/core';

export interface NameplateProps {
    profile: Profile;
}

const Nameplate: React.SFC<NameplateProps> = (props: NameplateProps) => {
    return (
        <div>
            <img
                id={'profile-picture-' + props.profile.userID}
                src={props.profile.profilePicture}
                alt='Profile picture'
                style={{
                    borderRadius: '50%',
                    height: '50px',
                    width: '50px',
                    verticalAlign: 'middle',
                    objectFit: 'cover',
                }}
            />
            <Link
                href={window.location.origin + '/user/' + props.profile.username}
                variant='h6'
                color='inherit'
                style={{marginLeft: '5px', fontWeight: 'lighter'}}
            >
                {props.profile.firstName + ' ' + props.profile.lastName}
            </Link>
        </div>
    );
};

export default Nameplate;
