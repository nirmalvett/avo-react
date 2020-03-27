import * as React from 'react';
import {Profile} from 'Http/types';
import {Link} from '@material-ui/core';

export interface NameplateProps {
    profile: Profile;
    diameter?: number;
    linkStyle?: React.CSSProperties;
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
                    height: props.diameter + 'px',
                    width: props.diameter + 'px',
                    verticalAlign: 'middle',
                    objectFit: 'cover',
                }}
            />
            <Link
                href={window.location.origin + '/user/' + props.profile.username}
                variant='h6'
                color='inherit'
                style={props.linkStyle}
            >
                {props.profile.firstName + ' ' + props.profile.lastName}
            </Link>
        </div>
    );
};

Nameplate.defaultProps = {
    diameter: 50,
    linkStyle: {marginLeft: '5px', fontWeight: 'lighter'},
};

export default Nameplate;
