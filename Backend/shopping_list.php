<?php


// Constants
define('DB_FILE', 'shopping_list.txt');

// Helper function to write data to file
function write_data($data) {
    file_put_contents(DB_FILE, json_encode($data));
}

// Helper function to read data from file
function read_data() {
    $data = json_decode(file_get_contents(DB_FILE), true);
    if (!$data) {
        $data = array('sequence' => 0, 'courses' => array());
    }
    return $data;
}

// Register endpoint
if ($_SERVER['REQUEST_METHOD'] == 'GET' && $_SERVER['REQUEST_URI'] == '/register') {
    $data = read_data();
    $client_id = uniqid();
    $data['clients'][$client_id] = array('seq' => 0);
    write_data($data);
    header('Content-Type: application/json');
    echo json_encode(array(
        'id' => $client_id,
        'courses' => $data['courses'],
        'sequence' => $data['sequence']
    ));
    exit;
}

// Courses endpoint
if ($_SERVER['REQUEST_METHOD'] == 'POST' && $_SERVER['REQUEST_URI'] == '/courses') {
    $data = read_data();
    $client_id = $_POST['id'];
    $client_seq = intval($_POST['seq']);
    if (!isset($data['clients'][$client_id])) {
        header('HTTP/1.1 400 Bad Request');
        echo json_encode(['error' => 'Client ID not found']);
        exit;
    }
    if ($client_seq != $data['sequence']) {
        header('HTTP/1.1 400 Bad Request');
        echo json_encode(['error' => 'Sequence number mismatch']);
        exit;
    }
    $changes = json_decode($_POST['courses'], true);
    foreach ($changes as $course) {
        switch ($course['type']) {
            case 'add':
                $data['courses'][$course['name']] = true;
                break;
            case 'remove':
                unset($data['courses'][$course['name']]);
                break;
        }
    }
    $data['clients'][$client_id]['seq'] = ++$data['sequence'];
    write_data($data);
    header('HTTP/1.1 200 OK');
    echo json_encode(['success' => true]);
    exit;
}

// Get courses endpoint
if ($_SERVER['REQUEST_METHOD'] == 'GET' && $_SERVER['REQUEST_URI'] == '/courses') {
    $data = read_data();
    $client_id = $_GET['id'];
    $client_seq = intval($_GET['seq']);
    if (!isset($data['clients'][$client_id])) {
        header("HTTP/1.1 400 Bad Request");
        echo json_encode(['error' => 'Invalid client ID']);
    } else if ($client_seq < 0) {
        header("HTTP/1.1 400 Bad Request");
        echo json_encode(['error' => 'Invalid sequence number']);
    } else {
        $server_seq = $data['sequence'];
        $changes = [];
        foreach ($data['clients'] as $id => $client) {
            if ($id != $client_id && $client['sequence'] > $client_seq) {
                $changes = array_merge($changes, $client['courses']);
            }
        }
        header("HTTP/1.1 200 OK");
        echo "<pre>";
        print_r(json_encode([
            'chg' => $changes,
            'sequence' => $server_seq
        ]));
        echo "</pre>";
    }    
    exit;
}



    
    exit;
}

?>