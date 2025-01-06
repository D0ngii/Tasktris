import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Permission,
  Role,
} from "react-native-appwrite";

export const config = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.jsm.aora",
  projectId: "671b41ee001ec64d01df",
  databaseId: "671b42e6002a481ec76d",
  userCollectionId: "671b430e001782ed5376",
  storageId: "671b443900397abd00d4",
  boardCollectionId: "6730c44b003ad0b0cb41",
  goalCollectionId: "6731881f0010640c4a0d",
};

const {
  endpoint,
  platform,
  projectId,
  databaseId,
  userCollectionId,
  // videoCollectionId,
  storageId,
  boardCollectionId,
} = config;
// Init your React Native SDK
const client = new Client();

client
  .setEndpoint(config.endpoint) // Your Appwrite Endpoint
  .setProject(config.projectId) // Your project ID
  .setPlatform(config.platform); // Your application ID or bundle ID.

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

const assignGoalsToBoard = (boardWidth, goals) => {
  // Initialize the board
  const board = Array.from({ length: boardWidth }, () =>
    Array(boardWidth).fill(0)
  );

  const directions = [
    [0, 1], // Right
    [1, 0], // Down
    [0, -1], // Left
    [-1, 0], // Up
  ];

  const isValidCell = (x, y) =>
    x >= 0 && x < boardWidth && y >= 0 && y < boardWidth && board[x][y] === 0;

  const placeGoal = (goalId, goalSize) => {
    let attempts = 0;

    while (attempts < 100) {
      attempts++;

      // Random starting point
      const startX = Math.floor(Math.random() * boardWidth);
      const startY = Math.floor(Math.random() * boardWidth);

      if (board[startX][startY] !== 0) continue;

      const cells = [[startX, startY]];
      board[startX][startY] = goalId;

      while (cells.length < goalSize) {
        const [currentX, currentY] =
          cells[Math.floor(Math.random() * cells.length)];

        // Shuffle directions for randomness
        const shuffledDirections = directions.sort(() => Math.random() - 0.5);

        let placed = false;
        for (const [dx, dy] of shuffledDirections) {
          const newX = currentX + dx;
          const newY = currentY + dy;

          if (isValidCell(newX, newY)) {
            board[newX][newY] = goalId;
            cells.push([newX, newY]);
            placed = true;
            break;
          }
        }

        if (!placed) break; // Break if no valid adjacent cell is found
      }

      // Check if goal was placed completely
      if (cells.length === goalSize) return true;

      // Undo partial placement
      for (const [x, y] of cells) {
        board[x][y] = 0;
      }
    }

    return false; // Failed to place the goal
  };

  // Shuffle goals to randomize placement order
  const shuffledGoals = goals.slice().sort(() => Math.random() - 0.5);

  shuffledGoals.forEach((goal) => {
    if (!placeGoal(goal.$id, goal.goal_num)) {
      console.error(`Failed to place goal ${goal.$id}`);
    }
  });

  return board;
};
export const updateBoard = async (board, colour) => {
  console.log("API CALL: UPDATE BOARD");
  try {
    const currBoard = await getActiveBoard();
    // Set width + length of board;
    await databases.updateDocument(
      config.databaseId,
      config.boardCollectionId,
      currBoard.$id,
      { board_display: board, colour_display: colour }
    );
  } catch (error) {
    console.error("Error in updateBoard:", error);
    throw new Error(error.message || "An unexpected error occurred.");
  }
};
export const check_board_completion = async () => {
  console.log("API CALL: CHECK BOARD COMPLETE");
  try {
    // Fetch all goals and the current board
    const goals = (await getGoals()).documents;
    const currBoard = await getActiveBoard();

    // Filter goals belonging to the current board

    // Check if all goals are completed
    const allCompleted = goals.every(
      (goal) => goal.current_num >= goal.goal_num
    );
    if (allCompleted) {
      console.log("YES");
      await databases.updateDocument(
        config.databaseId,
        config.boardCollectionId,
        currBoard.$id,
        { completed: true }
      );
    }
  } catch (error) {
    console.error("Error in check_board_completion:", error);
    throw new Error(error.message || "An unexpected error occurred.");
  }
};

export const updateGoal = async (goal_id, finished_flag) => {
  console.log("API CALL: UPDATE GOAL");
  try {
    // Fetch the current document to get the existing curr_num value
    const goal = await databases.getDocument(
      config.databaseId,
      config.goalCollectionId,
      goal_id
    );
    const updatedCurrNum = goal.current_num ? goal.current_num + 1 : 1; // Set to 1 if undefined or null
    let board_completed = false;
    if (finished_flag === true) {
      await databases.updateDocument(
        config.databaseId,
        config.goalCollectionId,
        goal_id,
        { current_num: updatedCurrNum, completed: true }
      );
      board_completed = await check_board_completion();
    } else {
      await databases.updateDocument(
        config.databaseId,
        config.goalCollectionId,
        goal_id,
        { current_num: updatedCurrNum }
      );
    }
    // Ensure curr_num exists and is a number
    return board_completed;
    // Update the document with the incremented current_num
  } catch (error) {
    console.error("Error in updateGoal:", error);
    throw new Error(error.message || "An unexpected error occurred.");
  }
};

export const setBoard = async (dimensions) => {
  console.log("API CALL: SETBOARD");
  try {
    const newDimensions = dimensions + 1; // Increase dimensions by 1
    const board = await getActiveBoard(); // Fetch current board
    // Set width + height of board
    await databases.updateDocument(
      config.databaseId,
      config.boardCollectionId,
      board.$id,
      { width: newDimensions, height: newDimensions }
    );

    const goals = (await getGoals()).documents; // Get all goals
    const board_table = assignGoalsToBoard(newDimensions, goals); // Assign goals to the new board
    const board_flat = board_table.flat().map((cell) => String(cell)); // Flatten the board

    // Initialize color matrix
    const colours = Array.from(
      { length: newDimensions },
      () => Array(newDimensions).fill(String("#979E9E")) // Default color, "0" represents an empty space
    );

    // Assign colors to the goals based on their ID or other properties
    for (let i = 0; i < newDimensions; i++) {
      for (let j = 0; j < newDimensions; j++) {
        const cellValue = board_table[i][j];

        if (cellValue !== "0") {
          // Assuming cellValue is the goal_id, you can map it to its color
          const goal = goals.find((goal) => goal.goal_id === cellValue);
          if (goal) {
            // Set the color for this goal on the board
            colours[i][j] = goal.colour; // Assuming `goal.colour` exists
          }
        }
      }
    }

    // Flatten the colors to match the flattened board
    const flattenedColours = colours.flat().map((color) => String(color));

    // Update the board with the new colors
    await databases.updateDocument(
      config.databaseId,
      config.boardCollectionId,
      board.$id,
      { board_display: board_flat, colour_display: flattenedColours }
    );
  } catch (error) {
    console.error("Error in setBoard:", error);
    throw new Error(error.message || "An unexpected error occurred.");
  }
};

export const getGoals = async () => {
  const board = await getActiveBoard();
  const goals = await databases.listDocuments(
    config.databaseId,
    config.goalCollectionId,
    [
      Query.equal("board", board.$id), // Filter by creator
    ]
  );
  return goals;
};

export const getActiveBoard = async () => {
  const userDocument = await getCurrentUser();

  const boards = await databases.listDocuments(
    config.databaseId,
    config.boardCollectionId,
    [
      Query.equal("creator", userDocument.$id), // Filter by creator
      Query.equal("active", true), // Filter by active status
    ]
  );
  if (boards.total === 0) {
    return null;
  }
  return boards.documents[0];
};

export const newGoal = async (title, goal_num, colour) => {
  try {
    const user = await account.get(); // Ensure the user is authenticated
    if (!user) throw Error;

    const board = await getActiveBoard();
    const id = ID.unique();
    const newGoal = await databases.createDocument(
      config.databaseId,
      config.goalCollectionId,
      id,
      {
        goal_num: goal_num,
        board: board.$id,
        colour: colour,
        title: title,
        completed: false,
        goal_id: id,
      },
      [
        Permission.read(Role.user(user.$id)), // Allow only the creator to read
        Permission.update(Role.user(user.$id)), // Allow only the creator to update
        Permission.delete(Role.user(user.$id)), // Allow only the creator to delete
        Permission.write(Role.user(user.$id)), // Allow only the creator to delete
      ]
    );

    return newBoard;
  } catch (error) {
    console.error("Error in newGoal:", error);
    throw new Error(error.message || "An unexpected error occurred.");
  }
};

export const getGoalColour = async (goal_id) => {
  try {
    if (goal_id == "0" || goal_id == "-1") return;
    const goal = await databases.listDocuments(
      config.databaseId,
      config.goalCollectionId,
      [Query.equal("goal_id", goal_id)]
    );
    // console.log(goal.documents[0].colour);
    return goal.documents[0].colour;
  } catch (error) {
    console.error("Error in getColour:", error);
    throw new Error(error.message || "An unexpected error occurred.");
    return;
  }
};

export const newBoard = async (title, duration) => {
  try {
    const user = await account.get(); // Ensure the user is authenticated
    if (!user) throw Error;
    const userDocument = await getCurrentUser();
    const board = await getActiveBoard();
    if (board != null) {
      await databases.updateDocument(
        config.databaseId,
        config.boardCollectionId,
        board.$id,
        { active: false } // Set 'active' to false
      );
    }

    const newBoard = await databases.createDocument(
      config.databaseId,
      config.boardCollectionId,
      ID.unique(),
      {
        title,
        creator: userDocument.$id,
        active: true,
        duration,
        width: null,
      },
      [
        Permission.read(Role.user(user.$id)), // Allow only the creator to read
        Permission.update(Role.user(user.$id)), // Allow only the creator to update
        Permission.delete(Role.user(user.$id)), // Allow only the creator to delete
        Permission.write(Role.user(user.$id)), // Allow only the creator to delete
      ]
    );

    // console.log("New board created:", newBoard);
    return newBoard;
  } catch (error) {
    console.error("Error in newBoard:", error);
    throw new Error(error.message || "An unexpected error occurred.");
    return;
  }
};

export const createUser = async (email, password, username) => {
  // Register User
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );
    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      config.databaseId,
      config.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl,
      }
    );
    return newUser;
  } catch (error) {
    throw new Error(error);
  }
};

export async function signIn(email, password) {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error) {
    throw new Error(error);
  }
}

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) throw Error;
    const currentUser = await databases.listDocuments(
      config.databaseId,
      config.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );
    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
  }
};

// // Get video posts that matches search query
export async function getUserBoards(userId) {
  try {
    const posts = await databases.listDocuments(databaseId, boardCollectionId, [
      Query.equal("creator", String(userId)), // Ensure it's a string if `creator` expects a string
    ]);
    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}

export const signOut = async () => {
  try {
    const session = await account.deleteSession("current");
    return session;
  } catch (error) {
    throw new Error(error);
  }
};
