import React from 'react'
import Typography from '@material-ui/core/Typography'

interface Idata{
    description?: string, 
}

interface Props{
    data : Idata
}


function Description(props : Props){
    return(
        <div className='descriptionDetail'>
            <Typography variant='h6'>{props.data.description}</Typography>
            <hr/>
        </div>
    )
}

export default Description