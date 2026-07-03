const { PrismaClient } = require("@prisma/client");
const { createClient } = require("@libsql/client");
const { PrismaLibSQL } = require("@prisma/adapter-libsql");

// Manually parse .env variables to ensure Prisma Client knows where to look
const fs = require("fs");
const path = require("path");
const envPath = path.join(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] ? match[2].trim() : "";
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      process.env[match[1]] = value;
    }
  });
}

let prisma;
if (process.env.TURSO_DATABASE_URL) {
  const libsql = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const adapter = new PrismaLibSQL(libsql);
  prisma = new PrismaClient({ adapter });
} else {
  prisma = new PrismaClient();
}

async function main() {
  console.log("Initializing Mock Crawler engine...");

  // Query existing employers to attach to crawled jobs
  const employers = await prisma.user.findMany({
    where: { role: "EMPLOYER" },
  });

  if (employers.length === 0) {
    console.error("Error: No employers found in database. Please run seeding first.");
    process.exit(1);
  }

  const getRandomEmployer = () => employers[Math.floor(Math.random() * employers.length)].id;

  const mockJobsData = [
    // 1. Vận tải & Giao nhận (Grab Competitor - 5 jobs)
    {
      title: "Xe dịch vụ 4 chỗ/7 chỗ (0% Chiết khấu)",
      description: "Tuyển tài xế chạy xe dịch vụ chở khách nội thành và đi tỉnh. Nhận 100% thu nhập, cam kết không thu chiết khấu phần trăm.",
      salary: "15.000.000đ - 25.000.000đ",
      companyName: "Gia tộc Vận Tải Việt",
      niche: "OTHERS",
      latitude: 10.7782,
      longitude: 106.6975,
      ai_tags: "driver, taxi-service, zero-commission, car-rental",
    },
    {
      title: "Xe ôm công nghệ tự do",
      description: "Đưa đón khách hàng quanh khu vực trung tâm quận 1 và quận 3. Thời gian linh hoạt tự chọn, thu nhập nhận đủ 100%.",
      salary: "8.000.000đ - 14.000.000đ",
      companyName: "Đội Xe Ôm Tự Quản",
      niche: "OTHERS",
      latitude: 10.7812,
      longitude: 106.7024,
      ai_tags: "motorbike-driver, delivery, travel, free-schedule",
    },
    {
      title: "Ba gác chở đồ trọn gói",
      description: "Chở hàng hóa, dọn nhà, chuyển trọ cho sinh viên và hộ gia đình nhỏ bằng xe ba gác máy. Cần sức khỏe tốt.",
      salary: "12.000.000đ - 18.000.000đ",
      companyName: "Vận Chuyển Thành Đô",
      niche: "OTHERS",
      latitude: 10.7741,
      longitude: 106.6991,
      ai_tags: "delivery-truck, heavy-lifting, cargo, relocation",
    },
    {
      title: "Shipper giao đồ ăn/hàng hóa quanh khu vực",
      description: "Giao đồ ăn từ nhà hàng đến khách hàng hoặc giao nhận bưu phẩm nhỏ. Thu nhập tính theo đơn hàng thực tế.",
      salary: "7.000.000đ - 12.000.000đ",
      companyName: "PawBook Express Delivery",
      niche: "OTHERS",
      latitude: 21.0264,
      longitude: 105.8502,
      ai_tags: "delivery, food-shipper, quick-service, mapping",
    },
    {
      title: "Chuyển nhà sinh viên giá rẻ",
      description: "Hỗ trợ bốc xếp đồ đạc, đóng gói hộp carton và vận chuyển đồ đạc từ phòng trọ cũ sang phòng trọ mới cho học sinh sinh viên.",
      salary: "300.000đ - 800.000đ / ngày",
      companyName: "Đội Vận Chuyển Tình Nguyện",
      niche: "OTHERS",
      latitude: 21.0315,
      longitude: 105.8567,
      ai_tags: "packing, moving-helper, student-price, labor",
    },

    // 2. Thợ thuyền & Sửa chữa (5 jobs)
    {
      title: "Sửa chữa điện lạnh tận nhà",
      description: "Khắc phục sự cố tủ lạnh không lạnh, sửa mạch máy giặt, vệ sinh điều hòa nhiệt độ tại nhà khách hàng.",
      salary: "12.000.000đ - 20.000.000đ",
      companyName: "Điện Lạnh Bách Khoa",
      niche: "MECHANIC",
      latitude: 10.7761,
      longitude: 106.7042,
      ai_tags: "air-conditioning, fridge-repair, electronics, technician",
    },
    {
      title: "Thợ hàn xì mái tôn nhà phố",
      description: "Thi công lắp đặt khung thép, hàn mái tôn, làm lan can cầu thang sắt và sửa cửa sắt bị xệ gỉ sét.",
      salary: "10.000.000đ - 15.000.000đ",
      companyName: "Cơ Khí Dân Dụng Tiến Phát",
      niche: "MECHANIC",
      latitude: 21.0253,
      longitude: 105.8589,
      ai_tags: "welding, steel-structure, ironwork, maintenance",
    },
    {
      title: "Sửa điện nước 24/7 khẩn cấp",
      description: "Xử lý rò rỉ đường ống nước ngầm, chập cháy điện âm tường, thay lắp vòi hoa sen, thiết bị vệ sinh.",
      salary: "11.000.000đ - 17.000.000đ",
      companyName: "Dịch Vụ Nước Sạch 24H",
      niche: "MECHANIC",
      latitude: 10.7798,
      longitude: 106.6953,
      ai_tags: "plumbing, electrical, emergency-repair, piping",
    },
    {
      title: "Cứu hộ xe máy/ô tô bị ngập nước",
      description: "Kích nổ bình ắc quy, xử lý chết máy do ngập nước, cẩu kéo xe ô tô gặp nạn về gara sửa chữa.",
      salary: "15.000.000đ - 25.000.000đ",
      companyName: "Gara Cứu Hộ Sài Gòn",
      niche: "MECHANIC",
      latitude: 21.0278,
      longitude: 105.8522,
      ai_tags: "roadside-assistance, car-tow, engine-drying, mechanic",
    },
    {
      title: "Thợ hàn inox & cửa nhôm kính",
      description: "Gia công lắp đặt tủ bếp inox, tủ nhôm kính, cửa kính cường lực cho các cửa tiệm mặt phố.",
      salary: "9.000.000đ - 13.000.000đ",
      companyName: "Nhôm Kính Thành Đạt",
      niche: "MECHANIC",
      latitude: 10.7753,
      longitude: 106.7018,
      ai_tags: "glass-fitting, aluminum, welding, doors-installation",
    },

    // 3. Dịch vụ gia đình (3 jobs)
    {
      title: "Giúp việc theo giờ căn hộ chung cư",
      description: "Lau dọn nhà cửa, quét bụi, giặt quần áo, nấu ăn bữa tối gia đình đơn giản theo yêu cầu của gia chủ.",
      salary: "50.000đ - 80.000đ / giờ",
      companyName: "HomeCare Maid Agency",
      niche: "OTHERS",
      latitude: 10.7712,
      longitude: 106.6961,
      ai_tags: "housekeeping, cleaning, cooking, laundry",
    },
    {
      title: "Vệ sinh máy lạnh chuyên sâu",
      description: "Thực hiện xịt rửa dàn nóng, dàn lạnh điều hòa treo tường, nạp gas bổ sung và kiểm tra thoát nước.",
      salary: "300.000đ - 500.000đ / bộ",
      companyName: "CleanAir Việt Nam",
      niche: "MECHANIC",
      latitude: 21.0299,
      longitude: 105.8533,
      ai_tags: "air-con-cleaning, gas-topup, home-maintenance, service",
    },
    {
      title: "Dọn vệ sinh sofa/đệm bằng máy hơi nước",
      description: "Sử dụng thiết bị chuyên dụng phun hút giặt sạch ghế sofa nỉ, đệm lò xo, thảm trải sàn văn phòng.",
      salary: "8.000.000đ - 11.000.000đ",
      companyName: "Thanh Tẩy Không Gian Sạch",
      niche: "OTHERS",
      latitude: 10.7824,
      longitude: 106.7039,
      ai_tags: "sofa-wash, mattress-cleaning, steam-extraction, sanitize",
    },

    // 4. Làm đẹp & F&B (4 jobs)
    {
      title: "Thợ phụ Spa/Nail chuyên nghiệp",
      description: "Hỗ trợ gội đầu dưỡng sinh, massage mặt, làm móng gel nghệ thuật cho khách hàng nữ tại tiệm.",
      salary: "6.000.000đ - 9.000.000đ",
      companyName: "Tiệm Nail Bông Sen",
      niche: "SPA",
      latitude: 10.7766,
      longitude: 106.6999,
      ai_tags: "nail-gel, hair-wash, skincare, customer-relations",
    },
    {
      title: "Tuyển thợ cắt tóc nam/nữ tạo kiểu",
      description: "Cắt tạo kiểu tóc nam (Undercut, Mohican) hoặc uốn nhuộm tóc nữ theo xu hướng thị trường thịnh hành.",
      salary: "8.000.000đ - 12.000.000đ + Doanh thu",
      companyName: "Hair Salon Bông Sen",
      niche: "SPA",
      latitude: 21.0245,
      longitude: 105.8519,
      ai_tags: "hair-cut, hair-dyeing, styling, beauty-salon",
    },
    {
      title: "Nhân viên phục vụ Cafe / Trà sữa",
      description: "Chào đón khách, bưng bê phục vụ cà phê nước uống, giữ gìn quầy thu ngân và quán gọn gàng.",
      salary: "4.500.000đ - 6.000.000đ",
      companyName: "Cafe Miệt Vườn",
      niche: "FNB",
      latitude: 10.7725,
      longitude: 106.6934,
      ai_tags: "waiter, waitress, tea-service, menu-ordering",
    },
    {
      title: "Pha chế Cafe máy (Barista) ca gãy",
      description: "Vận hành máy pha cà phê espresso, pha chế trà trái cây và các loại nước uống theo định lượng công thức.",
      salary: "6.000.000đ - 8.500.000đ",
      companyName: "Urban Coffee Roasters",
      niche: "FNB",
      latitude: 21.0333,
      longitude: 105.8555,
      ai_tags: "barista, espresso, milk-steaming, counter-cleaning",
    },

    // 5. Giải trí & Thú cưng (3 jobs)
    {
      title: "Cho thuê loa kẹo kéo hát tiệc gia đình",
      description: "Vận chuyển loa kéo công suất lớn tận nơi, setup micro không dây và hỗ trợ khách hàng kết nối bluetooth ca hát.",
      salary: "200.000đ - 400.000đ / ngày",
      companyName: "Âm Thanh Sự Kiện Đô Thành",
      niche: "OTHERS",
      latitude: 10.7791,
      longitude: 106.6922,
      ai_tags: "speaker-rental, karaoke, party-setup, delivery",
    },
    {
      title: "Chụp ảnh sự kiện dạo / Ngoại cảnh",
      description: "Chụp ảnh kỷ yếu, chụp ngoại cảnh cá nhân hoặc chụp ảnh tiệc sinh nhật bằng máy ảnh cơ chất lượng cao.",
      salary: "800.000đ - 1.500.000đ / buổi",
      companyName: "Pixel Studio Việt Nam",
      niche: "OTHERS",
      latitude: 21.0267,
      longitude: 105.8488,
      ai_tags: "photography, camera-operator, photo-editing, events",
    },
    {
      title: "Tắm tỉa lông chó mèo tại nhà khách",
      description: "Cắt móng, vệ sinh tai, tắm sấy thơm tho và cắt tỉa tạo kiểu lông nghệ thuật cho các bé cún, bé mèo.",
      salary: "8.000.000đ - 11.000.000đ",
      companyName: "Pet Grooming Mobile",
      niche: "SPA",
      latitude: 10.7749,
      longitude: 106.7058,
      ai_tags: "pet-grooming, dog-bath, cat-haircut, animal-care",
    },
  ];

  const iterationsCount = 8; // 8 * 20 = 160 jobs
  console.log(`Crawling and inserting ${mockJobsData.length * iterationsCount} multi-niche jobs into Turso...`);

  let insertedCount = 0;
  for (let cycle = 0; cycle < iterationsCount; cycle++) {
    for (let i = 0; i < mockJobsData.length; i++) {
      const jobData = mockJobsData[i];
      const employerId = getRandomEmployer();
      insertedCount++;

      // Introduce coordinate offsets to disperse pins on the map view
      const latOffset = (Math.random() - 0.5) * 0.015;
      const lngOffset = (Math.random() - 0.5) * 0.015;

      await prisma.job.create({
        data: {
          title: cycle > 0 ? `${jobData.title} (Chi nhánh #${cycle})` : jobData.title,
          description: jobData.description,
          salary: jobData.salary,
          companyName: jobData.companyName,
          employerId: employerId,
          niche: jobData.niche,
          latitude: jobData.latitude ? jobData.latitude + latOffset : null,
          longitude: jobData.longitude ? jobData.longitude + lngOffset : null,
          ai_tags: jobData.ai_tags,
          isBoosted: Math.random() > 0.7, // Randomly boost 30% of jobs for organic FOMO
        },
      });

      console.log(`[${insertedCount}/${mockJobsData.length * iterationsCount}] Inserted: ${jobData.title} (${jobData.niche})`);
    }
  }

  console.log("Mock Crawler synchronization finished! Turso database is populated with scaled multi-niche jobs. 🚀");
}

main()
  .catch(err => {
    console.error("Mock Crawler failed:", err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
