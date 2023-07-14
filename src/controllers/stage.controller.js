const socket = require("../../socket");
const Course = require("../models/stage.model");
const notificationModel = require("../models/notification.model");
const User = require("../models/user.model");

// Add a new course
const addCourse = async (req, res) => {
  const user = await User.findById(req.user._id);
  // Check if the user is an admin or a regular user
  if (user && (user.role === "admin" || user.role === "moderator")) {
    // Create a new course with the required properties and set the `id` property to `admin`
    const newCourse = new Course({
      level: req.body.level,
      type: req.body.type,
      title: req.body.title,
      slug: req.body.slug,
      description: req.body.description,
      category: req.body.category,
      duration: req.body.duration,
      featured: req.body.featured || false,
      creator: user.id,
      steps: [
        {
          title: "test",
          subtitle: "testtest",
          content:
            '<h2 class="text-2xl sm:text-3xl">Introduction</h1> <p class="lead">\n  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus aperiam\n  lab et fugiat id magnam minus nemo quam voluptatem. Culpa deleniti explica\n  nisi quod soluta.\n</p>\n<p>\n  Alias animi labque, deserunt distinctio eum excepturi fuga iure labore magni\n  molestias mollitia natus, officia pofro quis sunt temporibus veritatis\n  voluptatem, voluptatum. Aut blanditiis esse et illum maxim, obcaecati possimus\n  voluptate! Accusamus <em>adipisci</em> amet aperiam, assumenda consequuntur\n  fugiat inventore iusto magnam molestias natus necessitatibus, nulla pariatur.\n</p>\n<p>\n  Amet distinctio enim itaque minima minus nesciunt recusandae soluta\n  voluptatibus:\n</p>\n<blockquote>\n  <p>\n    Ad aliquid amet asperiores lab distinctio doloremque <code>eaque</code>,\n    exercitationem explicabo, minus mollitia natus necessitatibus odio omnis\n    pofro rem.\n  </p>\n</blockquote>\n<p>\n  Alias architecto asperiores, dignissimos illum ipsam ipsum itaque, natus\n  necessitatibus officiis, perferendis quae sed ullam veniam vitae voluptas!\n  Magni, nisi, quis! A <code>accusamus</code> animi commodi, consectetur\n  distinctio eaque, eos excepturi illum laboriosam maiores nam natus nulla\n  officiis perspiciatis rem <em>reprehenderit</em> sed tenetur veritatis.\n</p>\n<p>\n  Consectetur <code>dicta enim</code> error eveniet expedita, facere in itaque\n  labore <em>natus</em> quasi? Ad consectetur eligendi facilis magni quae quis,\n  quo temporibus voluptas voluptate voluptatem!\n</p>\n<p>\n  Adipisci alias animi <code>debitis</code> eos et impedit maiores, modi nam\n  nobis officia optio perspiciatis, rerum. Accusantium esse nostrum odit quis\n  quo:\n</p>\n<pre><code>h1 a {    display: block;    width: 300px;    height: 80px;}</code></pre>\n<p>\n  Accusantium aut autem, lab deleniti eaque fugiat fugit id ipsa iste molestiae,\n  <a>necessitatibus nemo quasi</a> .\n</p>\n<hr />\n<h2>Accusantium aspernatur autem enim</h2>\n<p>\n  Blanditiis, fugit voluptate! Assumenda blanditiis consectetur, labque\n  cupiditate ducimus eaque earum, fugiat illum ipsa, necessitatibus omnis\n  quaerat reiciendis totam. Architecto, <strong>facere</strong> illum molestiae\n  nihil nulla quibusdam quidem vel! Atque <em>blanditiis deserunt</em>.\n</p>\n<p>Debitis deserunt doloremque labore laboriosam magni minus odit:</p>\n<ol>\n  <li>Asperiores dicta esse maiores nobis officiis.</li>\n  <li>Accusamus aliquid debitis dolore illo ipsam molettiae possimus.</li>\n  <li>\n    Magnam mollitia pariatur perspiciatis quasi quidem tenetur voluptatem!\n    Adipisci aspernatur assumenda dicta.\n  </li>\n</ol>\n<p>Animi fugit incidunt iure magni maiores molestias.</p>\n<h3>Consequatur iusto soluta</h3>\n<p>\n  Aliquid asperiores corporis — deserunt dolorum ducimus eius eligendi explicabo\n  quaerat suscipit voluptas.\n</p>\n<p>Deserunt dolor eos et illum laborum magni molestiae mollitia:</p>\n<blockquote>\n  <p>\n    Autem beatae consectetur consequatur, facere, facilis fugiat id illo,\n    impedit numquam optio quis sunt ducimus illo.\n  </p>\n</blockquote>\n<p>\n  Adipisci consequuntur doloribus facere in ipsam maxime molestias pofro quam:\n</p>\n<figure>\n  <img src="assets/images/apps/help-center/image-1.jpg" alt="" />\n  <figcaption>\n    Accusamus blanditiis labque delectus esse et eum excepturi, impedit ipsam\n    iste maiores minima mollitia, nihil obcaecati placeat quaerat qui quidem\n    sint unde!\n  </figcaption>\n</figure>\n<p>\n  A beatae lab deleniti explicabo id inventore magni nisi omnis placeat\n  praesentium quibusdam:\n</p>\n<ul>\n  <li>Dolorem eaque laboriosam omnis praesentium.</li>\n  <li>Atque debitis delectus distinctio doloremque.</li>\n  <li>Fuga illo impedit minima mollitia neque obcaecati.</li>\n</ul>\n<p>Consequ eius eum excepturi explicabo.</p>\n<h2>Adipisicing elit atque impedit?</h2>\n<h3>Atque distinctio doloremque ea qui quo, repellendus.</h3>\n<p>\n  Delectus deserunt explicabo facilis numquam quasi! Laboriosam, magni,\n  quisquam. Aut, blanditiis commodi distinctio, facere fuga hic itaque iure\n  labore laborum maxime nemo neque provident quos recusandae sequi veritatis\n  illum inventore iure qui rerum sapiente.\n</p>\n<h3>Accusamus iusto sint aperiam consectetur …</h3>\n<p>\n  Aliquid assumenda ipsa nam odit pofro quaerat, quasi recusandae sint! Aut,\n  esse explicabo facilis fugit illum iure magni necessitatibus odio quas.\n</p>\n<ul>\n  <li>\n    <p>\n      <strong>Dolore natus placeat rem atque dignissimos laboriosam.</strong>\n    </p>\n    <p>\n      Amet repudiandae voluptates architecto dignissimos repellendus voluptas\n      dignissimos eveniet itaque maiores natus.\n    </p>\n    <p>\n      Accusamus aliquam debitis delectus dolorem ducimus enim eos,\n      exercitationem fugiat id iusto nostrum quae quos recusandae reiciendis\n      rerum sequi temporibus veniam vero? Accusantium culpa, cupiditate ducimus\n      eveniet id maiores modi mollitia nisi aliquid dolorum ducimus et illo in.\n    </p>\n  </li>\n  <li>\n    <p><strong>Ab amet deleniti dolor, et hic optio placeat.</strong></p>\n    <p>\n      Accusantium ad alias beatae, consequatur consequuntur eos error eveniet\n      expedita fuga laborum libero maxime nulla pofro praesentium rem rerum\n      saepe soluta ullam vero, voluptas? Architecto at debitis, doloribus harum\n      iure libero natus odio optio soluta veritatis voluptate.\n    </p>\n  </li>\n  <li>\n    <p>\n      <strong>At aut consectetur nam necessitatibus neque nesciunt.</strong>\n    </p>\n    <p>\n      Aut dignissimos labore nobis nostrum optio! Dolor id minima velit\n      voluptatibus. Aut consequuntur eum exercitationem fuga, harum id impedit\n      molestiae natus neque numquam perspiciatis quam rem voluptatum.\n    </p>\n  </li>\n</ul>\n<p>\n  Animi aperiam autem labque dolore enim ex expedita harum hic id impedit ipsa\n  laborum modi mollitia non perspiciatis quae ratione.\n</p>\n<h2>Alias eos excepturi facilis fugit.</h2>\n<p>\n  Alias asperiores, aspernatur corporis <a>delectus</a> est\n  <a>facilis</a> inventore dolore ipsa nobis nostrum officia quia, veritatis\n  vero! At dolore est nesciunt numquam quam. Ab animi <em>architecto</em> aut,\n  dignissimos eos est eum explicabo.\n</p>\n<p>\n  Adipisci autem consequuntur <code>labque cupiditate</code> dolor ducimus fuga\n  neque nesciunt:\n</p>\n<pre><code>module.exports = {    purge: [],    theme: {        extend: {},    },    variants: {},    plugins: [],}</code></pre>\n<p>Aliquid aspernatur eius fugit hic iusto.</p>\n<h3>Dolorum ducimus expedita?</h3>\n<p>\n  Culpa debitis explicabo maxime minus quaerat reprehenderit temporibus!\n  Asperiores, cupiditate ducimus esse est expedita fuga hic ipsam necessitatibus\n  placeat possimus? Amet animi aut consequuntur earum eveniet.\n</p>\n<ol>\n  <li>\n    <strong>Aspernatur at beatae corporis debitis.</strong>\n    <ul>\n      <li>\n        Aperiam assumenda commodi lab dicta eius, “fugit ipsam“ itaque iure\n        molestiae nihil numquam, officia omnis quia repellendus sapiente sed.\n      </li>\n      <li>\n        Nulla odio quod saepe accusantium, adipisci autem blanditiis lab\n        doloribus.\n      </li>\n      <li>Explicabo facilis iusto molestiae nisi nostrum obcaecati officia.</li>\n    </ul>\n  </li>\n  <li>\n    <strong>Nobis odio officiis optio quae quis quisquam quos rem.</strong>\n    <ul>\n      <li>Modi pariatur quod totam. Deserunt doloribus eveniet, expedita.</li>\n      <li>Ad beatae dicta et fugit libero optio quaerat rem repellendus./</li>\n      <li>Architecto atque consequuntur corporis id iste magni.</li>\n    </ul>\n  </li>\n  <li>\n    <strong>Deserunt non placeat unde veniam veritatis? Odio quod.</strong>\n    <ul>\n      <li>\n        Inventore iure magni quod repellendus tempora. Magnam neque, quia.\n        Adipisci amet.\n      </li>\n      <li>Consectetur adipisicing elit.</li>\n      <li>\n        labque eum expedita illo inventore iusto laboriosam nesciunt non, odio\n        provident.\n      </li>\n    </ul>\n  </li>\n</ol>\n<p>\n  A aliquam architecto consequatur labque dicta doloremque\n  <code>&lt;li&gt;</code> doloribus, ducimus earum, est\n  <code>&lt;p&gt;</code> eveniet explicabo fuga fugit ipsum minima minus\n  molestias nihil nisi non qui sunt vel voluptatibus? A dolorum illum nihil\n  quidem.\n</p>\n<ul>\n  <li>\n    <p><strong>Laboriosam nesciunt obcaecati optio qui.</strong></p>\n    <p>Doloremque magni molestias reprehenderit.</p>\n    <ul>\n      <li>Accusamus aperiam blanditiis <code>&lt;p&gt;</code> commodi</li>\n      <li>Dolorum ea explicabo fugiat in ipsum</li>\n    </ul>\n  </li>\n  <li>\n    <p><strong>Commodi dolor dolorem dolores eum expedita libero.</strong></p>\n    <p>\n      Accusamus alias consectetur dolores et, excepturi fuga iusto possimus.\n    </p>\n    <ul>\n      <li>\n        <p>\n          Accusantium ad alias atque aut autem consequuntur deserunt dignissimos\n          eaque iure <code>&lt;p&gt;</code> maxime.\n        </p>\n        <p>Dolorum in nisi numquam omnis quam sapiente sit vero.</p>\n      </li>\n      <li>\n        <p>Adipisci lab in nisi odit soluta sunt vitae commodi excepturi.</p>\n      </li>\n    </ul>\n  </li>\n  <li><p>Assumenda deserunt distinctio dolor iste mollitia nihil non?</p></li>\n</ul>\n<p>Consectetur adipisicing elit dicta dolor iste.</p>\n<h2>Consectetur ea natus officia omnis reprehenderit.</h2>\n<p>\n  Distinctio impedit quaerat sed! Accusamus\n  <a>aliquam aspernatur enim expedita explicabo</a> . Libero molestiae odio\n  quasi unde ut? Ab exercitationem id numquam odio quisquam!\n</p>\n<p>Explicabo facilis nemo quidem natus tempore:</p>\n<table class="table table-striped table-bordered">\n  <thead>\n    <tr>\n      <th>Wrestler</th>\n      <th>Origin</th>\n      <th>Finisher</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>Bret “The Hitman” Hart</td>\n      <td>Calgary, AB</td>\n      <td>Sharpshooter</td>\n    </tr>\n    <tr>\n      <td>Stone Cold Steve Austin</td>\n      <td>Austin, TX</td>\n      <td>Stone Cold Stunner</td>\n    </tr>\n    <tr>\n      <td>Randy Savage</td>\n      <td>Sarasota, FL</td>\n      <td>Elbow Drop</td>\n    </tr>\n    <tr>\n      <td>Vader</td>\n      <td>Boulder, CO</td>\n      <td>Vader Bomb</td>\n    </tr>\n    <tr>\n      <td>Razor Ramon</td>\n      <td>Chuluota, FL</td>\n      <td>Razor’s Edge</td>\n    </tr>\n  </tbody>\n</table>\n<p>\n  A aliquid autem lab doloremque, ea earum eum fuga fugit illo ipsa minus natus\n  nisi <code>&lt;span&gt;</code> obcaecati pariatur perferendis pofro\n  <code>suscipit tempore</code>.\n</p>\n<h3>Ad alias atque culpa <code>illum</code> earum optio</h3>\n<p>\n  Architecto consequatur eveniet illo in iure laborum minus omnis quibusdam\n  sequi temporibus? Ab aliquid\n  <em>“atque dolores molestiae nemo perferendis”</em> reprehenderit saepe.\n</p>\n<p>\n  Accusantium aliquid eligendi est fuga natus, <code>quos</code> vel? Adipisci\n  aperiam asperiores aspernatur consectetur cupiditate\n  <a><code>@distinctio/doloribus</code></a> et exercitationem expedita, facere\n  facilis illum, impedit inventore ipsa iure iusto magnam, magni minus nesciunt\n  non officia possimus quod reiciendis.\n</p>\n<h4>Cupiditate explicabo <code>hic</code> maiores</h4>\n<p>\n  Aliquam amet consequuntur distinctio <code>ea</code> est\n  <code>excepturi</code> facere illum maiores nisi nobis non odit officiis\n  quisquam, similique tempora temporibus, tenetur ullam\n  <code>voluptates</code> adipisci aperiam deleniti\n  <code>doloremque</code> ducimus <code>eos</code>.\n</p>\n<p>\n  Ducimus qui quo tempora. lab enim explicabo <code>hic</code> inventore qui\n  soluta voluptates voluptatum? Asperiores consectetur delectus dolorem fugiat\n  ipsa pariatur, quas <code>quos</code> repellendus <em>repudiandae</em> sunt\n  aut blanditiis.\n</p>\n<h3>Asperiores aspernatur autem error praesentium quidem.</h3>\n<h4>\n  Ad blanditiis commodi, doloribus id iste <code>repudiandae</code> vero vitae.\n</h4>\n<p>\n  Atque consectetur lab debitis enim est et, facere fugit impedit, possimus\n  quaerat quibusdam.\n</p>\n<p>\n  Dolorem nihil placeat quibusdam veniam? Amet architecto at consequatur\n  eligendi eveniet excepturi hic illo impedit in iste magni maxime modi nisi\n  nulla odio placeat quidem, quos rem repellat similique suscipit voluptate\n  voluptates nobis omnis quo repellendus.\n</p>\n<p>\n  Assumenda, eum, minima! Autem consectetur fugiat iste sit! Nobis omnis quo\n  repellendus.\n</p>\n',
        },
      ],
    });
    //save the post to the notification
    const notification = new notificationModel({
      title: "New course",
      description: "new course created",
      time: new Date(),
      read: false,
      link: "/apps/courses/level/" + req.body.level,
      useRouter: true,
      icon: "heroicons-solid:book-open",
    });
    await notification.save();

    //send notification
    socket.getIO().emit("notificationReceived", {
      title: "New course",
      description: "new course created",
      time: new Date(),
      read: false,
      link: "/apps/academy/courses/" + req.body.level,
      useRouter: true,
      icon: "heroicons-solid:book-open",
    });
    // Save the new course to the database
    newCourse.save((err, savedCourse) => {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.send(savedCourse);
      }
    });
  } else {
    // Check if the course type is valid for regular users
    const allowedTypes = ["resumé"]; // replace with the valid course types for regular users
    if (!allowedTypes.includes(req.body.type)) {
      return res.status(403).send("You cannot create this type of course");
    }
    // Create a new course with the required properties and set the `id` property to `user`
    const newCourse = new Course({
      level: req.body.level,
      type: req.body.type,
      title: req.body.title,
      slug: req.body.slug,
      description: req.body.description,
      category: req.body.category,
      duration: req.body.duration,
      featured: req.body.featured || false,
      creator: user.id,
    });

    //save the post to the notification
    const notification = new notificationModel({
      title: "New course",
      description: "new course created",
      time: new Date(),
      read: false,
      link: "/apps/academy/courses/" + req.body.level,
      useRouter: true,
      icon: "heroicons-solid:book-open",
    });
    await notification.save();

    //send notification
    socket.getIO().emit("notificationReceived", {
      title: "nouveau stage",
      description: "nouveau stage crée",
      time: new Date(),
      read: false,
      link: "/apps/academy/courses/" + req.body.level,
      useRouter: true,
      icon: "heroicons-solid:book-open",
    });
    // Save the new course to the database
    newCourse.save((err, savedCourse) => {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.send(savedCourse);
      }
    });
  }
};

// Get all courses
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("category");

    const newCourses = courses.map((course) => {
      return {
        id: course._id,
        level: course.level,
        type: course.type,
        title: course.title,
        slug: course.slug,
        description: course.description,
        category: course.category.slug,
        duration: course.duration,
        featured: course.featured,
        creator: course.creator,
        progress: course.progress,
        steps: course.steps,
      };
    });
    res.status(200).send(newCourses);
  } catch (error) {
    res.status(500).send({ message: "something went wrong !" });
  }
};

// Get a single course
const getCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId).populate("category");
    res.status(200).send(course);
  } catch (error) {
    res.status(500).send({ message: "something went wrong !" });
  }
};
const getCoursebylevel = async (req, res) => {
  try {
    const level = req.params.level;
    let courses;
    if (level) {
      courses = await Course.find({ level: parseInt(level) })
        .populate("category")
        .lean();
    } else {
      courses = await Course.find().lean();
    }
    console.log(courses);
    courses.forEach((item) => {
      item.id = item._id;
    });
    res.status(200).send(courses);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong!" });
  }
};
// Delete a course
const deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const user = await User.findById(req.user._id);

    // Check if the user is an admin or the course belongs to the user
    if (user.role === "admin" || user.courses.includes(courseId)) {
      await Course.findByIdAndDelete(courseId);
      res.send("Course deleted successfully");
    } else {
      res.status(401).send("Unauthorized");
    }
  } catch (error) {
    res.status(500).send("Server error");
  }
};

// Update a course
const updateCourse = async (req, res) => {
  const user = await User.findById(req.user._id);
  // Check if the user is an admin or a regular user
  if (user && (user.role === "admin" || user.role === "moderator")) {
    try {
      const updatedCours = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.send(updatedCours);
    } catch (error) {
      console.error(error);
      res.status(500).send(error.message);
    }
  } else {
    const cours = await Course.findById(req.params.id);

    if (user._id == cours.IdUser && cours.type == "resumé") {
      try {
        const allowedTypes = ["resumé"]; // replace with the valid course types for regular users
        if (!allowedTypes.includes(req.body.type)) {
          return res.status(400).send("Invalid course type for this user");
        }
        const updatedCours = await Cours.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.send(updatedCours);
      } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
      }
    }
  }
};
// update Course Progress
const updateCourseProgress = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId);
    course.progress.currentStep = req.body.progress.currentStep;
    await course.save();
    res.status(200).send(course);
  } catch (error) {
    res.status(500).send({ message: "something went wrong !" });
  }
};

//get all category
const getAllCategory = async (req, res) => {
  try {
    const categories = await Course.find().distinct("category");
    res.status(200).send(categories);
  } catch (error) {
    res.status(500).send({ message: "something went wrong !" });
  }
};

module.exports = {
  addCourse,
  deleteCourse,
  updateCourse,
  getAllCourses,
  getCourse,
  getAllCategory,
  updateCourseProgress,
  getCoursebylevel,
};
