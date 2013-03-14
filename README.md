Team Members
-------
Alon Sigal	                998156846 	g1sigal     <br>
Henry Ku 	                998551348	g2kuhenr    <br>
Simon Song			                                <br>
Zheng (Lionheart) Xiong     998182112   c3xiongz    <br>


CDF environment
-------
greywolf/redwolf <br>
port:31355 <br>

Additional Modules Installed
---------
npm install request <br>
npm install mysql<br>
npm install cron<br>
npm install querystring

Sequence Diagram (not done)
---------
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
        <td>500</td>
        <td>/</td>
    </tr>

    <tr>
        <td>blog_url</td>
        <td>not null</td>
        <td>char</td>
        <td>500</td>
        <td>/</td>
    </tr>
    
    <tr>
        <td>txt</td>
        <td>/</td>
        <td>char</td>
        <td>500</td>
        <td>/</td>
    </tr>
    
    <tr>
        <td>img</td>
        <td>/</td>
        <td>char</td>
        <td>500</td>
        <td>/</td>
    </tr>
    
    <tr>
        <td>dt</td>
        <td>not null</td>
        <td>timestamp</td>
        <td>/</td>
        <td>/</td>
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
        <td>timestamp</td>
        <td>/</td>
        <td>/</td>
    </tr>
    
    <tr>
        <td>url</td>
        <td>/</td>
        <td>char</td>
        <td>500</td>
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




####LIKES

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
        <td>foreign key, not null</td>
        <td>char</td>
        <td>500</td>
        <td>POST 'url'</td>
    </tr>

    <tr>
        <td>person</td>
        <td>foreign key, not null</td>
        <td>char</td>
        <td>500</td>
        <td>BLOG 'url'</td>
    </tr>
    
</table>

