 names of all your team members,
 
 which CDF environment (greywolf/redwolf) 
 
 and port your server is running on
 
 details about your database, 
 
 the various components in your system and how they interact (sequence diagram), inputs outputs functions etc


Database Diagram
------
####BLOG

<table>
    <tr>
        <td><b>column</b></td>
        <td><b>property</b></td>
        <td><b>type</b></td>
        <td><b>size limit</b></td>
        <td><b>reference from</b></td>
    </tr>
    
    <tr>
        <td>url</td>
        <td>primary</td>
        <td>char</td>
        <td>50</td>
        <td>/</td>
    </tr>
</table>

####POST

<table>
    <tr>
        <td><b>column</b></td>
        <td><b>property</b></td>
        <td><b>type</b></td>
        <td><b>size limit</b></td>
        <td><b>reference from</b></td>
    </tr>
    
    <tr>
        <td>url</td>
        <td>primary</td>
        <td>char</td>
        <td>50</td>
        <td>/</td>
    </tr>

    <tr>
        <td>blog_url</td>
        <td>not null</td>
        <td>char</td>
        <td>50</td>
        <td>/</td>
    </tr>
    
    <tr>
        <td>txt</td>
        <td>/</td>
        <td>char</td>
        <td>50</td>
        <td>/</td>
    </tr>
    
    <tr>
        <td>img</td>
        <td>/</td>
        <td>char</td>
        <td>50</td>
        <td>/</td>
    </tr>
    
    <tr>
        <td>dt</td>
        <td>not null</td>
        <td>timestamp</td>
        <td>/</td>
        <td>/</td>
    </tr>
    
    <tr>
        <td>last_track</td>
        <td>not null</td>
        <td>date</td>
        <td>/</td>
        <td>/</td>
    </tr>
    
    <tr>
        <td>note_count</td>
        <td>not null</td>
        <td>integer</td>
        <td>/</td>
        <td>/</td>
    </tr>
    
</table>


####IMAGE

<table>
    <tr>
        <td><b>column</b></td>
        <td><b>property</b></td>
        <td><b>type</b></td>
        <td><b>size limit</b></td>
        <td><b>reference from</b></td>
    </tr>
    
    <tr>
        <td>url</td>
        <td>/</td>
        <td>char</td>
        <td>50</td>
        <td>/</td>
    </tr>
    
    <tr>
        <td>post</td>
        <td>/</td>
        <td>char</td>
        <td>50</td>
        <td>POST 'url'</td>
    </tr>
</table>


####TIME_STAMP

<table>
    <tr>
        <td><b>column</b></td>
        <td><b>property</b></td>
        <td><b>type</b></td>
        <td><b>size limit</b></td>
        <td><b>reference from</b></td>
    </tr>
    
    <tr>
        <td>id</td>
        <td>primary</td>
        <td>integer</td>
        <td>/</td>
        <td>/</td>
    </tr>

    <tr>
        <td>ts</td>
        <td>/</td>
        <td>date</td>
        <td>/</td>
        <td>/</td>
    </tr>
    
    <tr>
        <td>url</td>
        <td>/</td>
        <td>char</td>
        <td>50</td>
        <td>POST 'url'</td>
    </tr>
    
    <tr>
        <td>seq</td>
        <td>/</td>
        <td>integer</td>
        <td>/</td>
        <td>/</td>
    </tr>
    
    <tr>
        <td>inc</td>
        <td>/</td>
        <td>integer</td>
        <td>/</td>
        <td>/</td>
    </tr>
    
    <tr>
        <td>cnt</td>
        <td>/</td>
        <td>integer</td>
        <td>/</td>
        <td>/</td>
    </tr>
    
</table>
