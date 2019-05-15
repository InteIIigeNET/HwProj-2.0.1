import React from 'react';
import PropTypes from 'prop-types';
import { createStyles, withStyles, WithStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import AuthService from './AuthService'

const styles = createStyles({
  root: {
    flexGrow: 1,
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
});

export interface Props extends WithStyles<typeof styles> {}

interface IAppBarState {
  loaded: boolean,
  loggedIn: boolean
}

class ButtonAppBar extends React.Component<Props, IAppBarState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loaded: false,
      loggedIn: false
    }
  }

  public render() {
    let authService = new AuthService();

    const { loaded, loggedIn } = this.state;
    const { classes } = this.props;

    if (loaded) {
      return (
        <div className={classes.root}>
          <AppBar position="static">
            <Toolbar>
              <Button href="/" color="inherit">HwProj</Button>
              <Typography variant="h6" color="inherit" className={classes.grow}>
              </Typography>
              <Button href="/create_course" color="inherit">Create course</Button>
              {loggedIn &&
              <Button onClick={() => {
                authService.logout();
                this.setState({loaded: true, loggedIn: false})
              }}  color="inherit">Logout</Button>
              }
              {!loggedIn &&
              <Button href="/login" color="inherit">Login</Button>
              }
            </Toolbar>
          </AppBar>
          <br />
        </div>
      );
    }

    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            <Button href="/" color="inherit">HwProj</Button>
            <Typography variant="h6" color="inherit" className={classes.grow}>
            </Typography>
          </Toolbar>
        </AppBar>
        <br />
      </div>
    );
  }

  componentDidMount() {
    let authService = new AuthService();
    this.setState({loaded: true, loggedIn: authService.loggedIn()});
  }
}

(ButtonAppBar as React.ComponentClass<Props>).propTypes = {
  classes: PropTypes.object.isRequired,
} as any;

export default withStyles(styles)(ButtonAppBar);