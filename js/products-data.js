// BIDAYA HOME - Central Products & Governorates Database Registry
(function () {
  const BIDAYA_DATA = {
    categories: [
      {
        id: "living-room",
        nameEn: "Living Room",
        nameAr: "غرفة المعيشة",
        icon: "fa-couch"
      },
      {
        id: "bedroom",
        nameEn: "Bedroom",
        nameAr: "غرفة النوم",
        icon: "fa-bed"
      },
      {
        id: "kitchen",
        nameEn: "Kitchen & Dining",
        nameAr: "المطبخ وغرفة الطعام",
        icon: "fa-utensils"
      },
      {
        id: "bathroom",
        nameEn: "Bathroom",
        nameAr: "الحمام",
        icon: "fa-shower"
      },
      {
        id: "decor",
        nameEn: "Decor & Lighting",
        nameAr: "الديكور والإضاءة",
        icon: "fa-lightbulb"
      }
    ],

    products: [
      {
        id: "p1",
        category: "bedroom",
        nameEn: "Premium Cotton Bedsheet Set (4 Pieces)",
        nameAr: "طقم ملاءات سرير قطن فاخر (٤ قطع)",
        price: 1499,
        oldPrice: 1999,
        discount: 25,
        stock: "in-stock",
        image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80",
        images: [
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?auto=format&fit=crop&w=600&q=80"
        ],
        descriptionEn: "Experience ultimate luxury and comfort with our premium 100% Egyptian cotton bedsheet set. Includes 1 fitted sheet, 1 flat sheet, and 2 pillowcases. Breathable, durable, and exceptionally soft.",
        descriptionAr: "جرب منتهى الفخامة والراحة مع طقم ملاءات السرير المصنوع من القطن المصري ١٠٠٪. يشتمل الطقم على ملاءة مطاطية، وملاءة مسطحة، و٢ غطاء وسادة. نسيج يسمح بمرور الهواء، متين وناعم للغاية.",
        specsEn: {
          "Material": "100% Egyptian Cotton",
          "Thread Count": "400 TC",
          "Set Includes": "1 Fitted Sheet, 1 Flat Sheet, 2 Pillowcases",
          "Origin": "Made in Egypt"
        },
        specsAr: {
          "الخامة": "قطن مصري ١٠٠٪",
          "عدد الخيوط": "٤٠٠ عقدة",
          "المكونات": "ملاءة مطاطية، ملاءة مسطحة، ٢ غطاء وسادة",
          "بلد المنشأ": "صنع في مصر"
        },
        featured: true,
        bestSeller: true,
        newArrival: false
      },
      {
        id: "p2",
        category: "living-room",
        nameEn: "Modern Velvet Accent Armchair",
        nameAr: "كرسي صالون مخملي حديث",
        price: 4800,
        oldPrice: 6000,
        discount: 20,
        stock: "in-stock",
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
        images: [
          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=600&q=80"
        ],
        descriptionEn: "Add a touch of contemporary elegance to your living room. Built with high-density foam padding and upholstered in stain-resistant velvet fabric. Sturdy wooden frame and golden metal legs.",
        descriptionAr: "أضف لمسة من الأناقة المعاصرة إلى غرفة المعيشة الخاصة بك. تم تصنيعه ببطانة رغوية عالية الكثافة ومنجد بنسيج مخملي مقاوم للبقع. هيكل خشبي متين وأرجل معدنية ذهبية.",
        specsEn: {
          "Upholstery": "Premium Velvet",
          "Leg Finish": "Gold-plated steel",
          "Weight Capacity": "150 kg",
          "Dimensions": "85cm x 80cm x 75cm"
        },
        specsAr: {
          "التنجيد": "قطيفة فاخرة",
          "طلاء الأرجل": "حديد مطلي بالذهب",
          "أقصى وزن": "١٥٠ كجم",
          "الأبعاد": "٨٥ سم × ٨٠ سم × ٧٥ سم"
        },
        featured: true,
        bestSeller: false,
        newArrival: true
      },
      {
        id: "p3",
        category: "decor",
        nameEn: "Minimalist Ceramic Flower Vase Set",
        nameAr: "طقم فازات ورد سيراميك بسيط",
        price: 350,
        oldPrice: 450,
        discount: 22,
        stock: "in-stock",
        image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=600&q=80",
        images: [
          "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=600&q=80"
        ],
        descriptionEn: "A set of 2 matte ceramic vases featuring a textured finish and clean lines. Perfect for displaying dry pampas grass, fresh flowers, or as stand-alone sculptural statement pieces.",
        descriptionAr: "طقم مكون من ٢ فازة سيراميك غير لامع يتميز بلمسة نهائية بارزة وخطوط واضحة. مثالي لعرض عشب البامباس المجفف أو الزهور الطازجة أو كقطع فنية قائمة بذاتها.",
        specsEn: {
          "Material": "Textured Ceramic",
          "Color": "Off-white / Sand beige",
          "Quantity": "Set of 2",
          "Height": "Large: 25cm, Small: 18cm"
        },
        specsAr: {
          "الخامة": "سيراميك ذو ملمس بارز",
          "اللون": "أوف وايت / بيج رملي",
          "العدد": "طقم من قطعتين",
          "الارتفاع": "الكبير: ٢٥ سم، الصغير: ١٨ سم"
        },
        featured: false,
        bestSeller: true,
        newArrival: true
      },
      {
        id: "p4",
        category: "kitchen",
        nameEn: "16-Piece Ceramic Dinnerware Set",
        nameAr: "طقم عشاء سيراميك ١٦ قطعة",
        price: 2800,
        oldPrice: 3200,
        discount: 12,
        stock: "in-stock",
        image: "https://images.unsplash.com/photo-1543083477-4f7f44dbe34b?auto=format&fit=crop&w=600&q=80",
        images: [
          "https://images.unsplash.com/photo-1543083477-4f7f44dbe34b?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1535401991746-da3d9055713e?auto=format&fit=crop&w=600&q=80"
        ],
        descriptionEn: "Elegant, organic-edged stoneware set containing dinner plates, salad plates, soup bowls, and mugs. Microwave and dishwasher safe with a high-resistance scratch glaze.",
        descriptionAr: "طقم أواني فخارية أنيق ذو حواف عضوية يحتوي على أطباق عشاء وأطباق سلطة وأوعية شوربة وأكواب. آمن للاستخدام في الميكروويف وغسالة الأطباق ومغطى بطبقة طلاء عالية المقاومة للخدش.",
        specsEn: {
          "Material": "Stoneware Ceramic",
          "Pieces": "16 Pieces (Serves 4)",
          "Includes": "4 Dinner Plates, 4 Salad Plates, 4 Bowls, 4 Mugs",
          "Dishwasher Safe": "Yes"
        },
        specsAr: {
          "الخامة": "سيراميك حجري",
          "عدد القطع": "١٦ قطعة (تكفي ٤ أفراد)",
          "يشتمل على": "٤ أطباق عشاء، ٤ أطباق سلطة، ٤ بولات شوربة، ٤ مجات",
          "آمن في غسالة الأطباق": "نعم"
        },
        featured: true,
        bestSeller: false,
        newArrival: false
      },
      {
        id: "p5",
        category: "bathroom",
        nameEn: "Luxury Bamboo Bath Towels (Set of 3)",
        nameAr: "فوط حمام بامبو فاخرة (طقم ٣ قطع)",
        price: 750,
        oldPrice: 950,
        discount: 21,
        stock: "in-stock",
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
        images: [
          "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1616627561950-9f746e330187?auto=format&fit=crop&w=600&q=80"
        ],
        descriptionEn: "Highly absorbent, ultra-soft towels blended with premium bamboo fibers and Egyptian cotton. Naturally hypoallergenic, antibacterial, and quick-drying.",
        descriptionAr: "فوط عالية الامتصاص وناعمة للغاية ممزوجة بألياف الخيزران (البامبو) الممتازة والقطن المصري. مضادة للحساسية والبكتيريا بشكل طبيعي وسريعة الجفاف.",
        specsEn: {
          "Material": "60% Bamboo / 40% Egyptian Cotton",
          "Weight": "600 GSM (Heavyweight)",
          "Set Sizes": "Bath: 70x140cm, Hand: 50x90cm, Face: 30x50cm",
          "Antibacterial": "Yes"
        },
        specsAr: {
          "الخامة": "٦٠٪ بامبو / ٤٠٪ قطن مصري",
          "الوزن": "٦٠٠ جرام لكل متر مربع",
          "أحجام الطقم": "حمام: ٧٠×١٤٠ سم، يد: ٥٠×٩٠ سم، وجه: ٣٠×٥٠ سم",
          "مضاد للبكتيريا": "نعم"
        },
        featured: false,
        bestSeller: true,
        newArrival: false
      },
      {
        id: "p6",
        category: "living-room",
        nameEn: "Nordic Geometric Area Rug",
        nameAr: "سجادة صوف هندسية نورديك",
        price: 1850,
        oldPrice: 2200,
        discount: 15,
        stock: "in-stock",
        image: "https://images.unsplash.com/photo-1531835551805-16d864c8d311?auto=format&fit=crop&w=600&q=80",
        images: [
          "https://images.unsplash.com/photo-1531835551805-16d864c8d311?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=600&q=80"
        ],
        descriptionEn: "A hand-tufted modern rug featuring a Nordic geometric layout. Crafted from a premium wool blend with a soft medium pile that feels delightful underfoot.",
        descriptionAr: "سجادة عصرية منسوجة يدوياً تتميز بتصميم هندسي نورديك. مصنوعة من مزيج صوف ممتاز مع وبر ناعم متوسط يمنحك شعوراً رائعاً تحت قدميك.",
        specsEn: {
          "Material": "80% Wool / 20% Cotton Backing",
          "Dimensions": "160cm x 230cm",
          "Pile Height": "12 mm",
          "Care": "Vacuum clean / Professional wash only"
        },
        specsAr: {
          "الخامة": "٨٠٪ صوف / ٢٠٪ قطن (خلفية)",
          "الأبعاد": "١٦٠ سم × ٢٣٠ سم",
          "ارتفاع الوبر": "١٢ ملم",
          "العناية": "مكنسة كهربائية / غسيل احترافي فقط"
        },
        featured: false,
        bestSeller: false,
        newArrival: true
      },
      {
        id: "p7",
        category: "decor",
        nameEn: "Dimmable Brass Floor Lamp",
        nameAr: "مصباح أرضي نحاسي قابل للتعتيم",
        price: 1200,
        oldPrice: 1500,
        discount: 20,
        stock: "out-of-stock",
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
        images: [
          "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80"
        ],
        descriptionEn: "Modern sleek arch floor lamp with a solid marble base and brushed brass neck. Features a rotary dimmer switch on the pole to customize ambient light intensity.",
        descriptionAr: "مصباح أرضي مقوس بتصميم عصري أنيق مع قاعدة رخامية صلبة وعنق نحاسي مصقول. يتميز بمفتاح تعتيم دوار على العمود لتخصيص كثافة الإضاءة المحيطة.",
        specsEn: {
          "Material": "Brushed Brass, Solid Marble",
          "Bulb Type": "E27 LED (dimmable bulb included)",
          "Height": "175cm",
          "Cord Length": "2 m"
        },
        specsAr: {
          "الخامة": "نحاس مصقول، رخام طبيعي صلب",
          "نوع اللمبة": "E27 LED (مرفق لمبة قابلة للتعتيم)",
          "الارتفاع": "١٧٥ سم",
          "طول السلك": "٢ متر"
        },
        featured: true,
        bestSeller: false,
        newArrival: false
      },
      {
        id: "p8",
        category: "bedroom",
        nameEn: "Ergonomic Memory Foam Pillow",
        nameAr: "وسادة طبية ميموري فوم مريحة",
        price: 900,
        oldPrice: 1100,
        discount: 18,
        stock: "in-stock",
        image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80",
        images: [
          "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80"
        ],
        descriptionEn: "Contoured orthopaedic design that cradles your neck and head. Made of premium pressure-relieving memory foam with a washable cooling bamboo-fiber zip cover.",
        descriptionAr: "تصميم طبي متناسق يحتضن رقبتك ورأسك. مصنوع من إسفنج رغوي (ميموري فوم) ممتاز يخفف الضغط مع غطاء بسحاب مصنوع من ألياف البامبو الباردة قابل للغسل.",
        specsEn: {
          "Material": "Pressure-relieving Memory Foam",
          "Dimensions": "60cm x 40cm x 12cm",
          "Cover": "Cooling Bamboo fabric (Washable)",
          "Ideal For": "Side and back sleepers"
        },
        specsAr: {
          "الخامة": "إسفنج ميموري فوم لتخفيف الضغط",
          "الأبعاد": "٦٠ سم × ٤٠ سم × ١٢ سم",
          "الغطاء": "قماش البامبو البارد (قابل للغسل)",
          "مثالي لـ": "الذين ينامون على الظهر والجانب"
        },
        featured: false,
        bestSeller: false,
        newArrival: true
      },
      {
        id: "temp_living",
        category: "living-room",
        nameEn: "Sample Living Room Item",
        nameAr: "عينة غرفة جلوس",
        price: 1000,
        oldPrice: 1200,
        discount: 20,
        stock: "in-stock",
        image: "https://via.placeholder.com/600",
        images: ["https://via.placeholder.com/600"],
        descriptionEn: "Placeholder product for living room.",
        descriptionAr: "منتج نائب لغرفة الجلوس.",
        specsEn: {"Sample": "Spec"},
        specsAr: {"نموذج": "مواصفة"},
        featured: false,
        bestSeller: false,
        newArrival: false
      },
      {
        id: "temp_bedroom",
        category: "bedroom",
        nameEn: "Sample Bedroom Item",
        nameAr: "عينة غرفة نوم",
        price: 800,
        oldPrice: 1000,
        discount: 20,
        stock: "in-stock",
        image: "https://via.placeholder.com/600",
        images: ["https://via.placeholder.com/600"],
        descriptionEn: "Placeholder product for bedroom.",
        descriptionAr: "منتج نائب لغرفة النوم.",
        specsEn: {"Sample": "Spec"},
        specsAr: {"نموذج": "مواصفة"},
        featured: false,
        bestSeller: false,
        newArrival: false
      },
      {
        id: "temp_kitchen",
        category: "kitchen",
        nameEn: "Sample Kitchen Item",
        nameAr: "عينة مطبخ",
        price: 1200,
        oldPrice: 1500,
        discount: 20,
        stock: "in-stock",
        image: "https://via.placeholder.com/600",
        images: ["https://via.placeholder.com/600"],
        descriptionEn: "Placeholder product for kitchen.",
        descriptionAr: "منتج نائب للمطبخ.",
        specsEn: {"Sample": "Spec"},
        specsAr: {"نموذج": "مواصفة"},
        featured: false,
        bestSeller: false,
        newArrival: false
      },
      {
        id: "temp_bathroom",
        category: "bathroom",
        nameEn: "Sample Bathroom Item",
        nameAr: "عينة حمام",
        price: 500,
        oldPrice: 700,
        discount: 28,
        stock: "in-stock",
        image: "https://via.placeholder.com/600",
        images: ["https://via.placeholder.com/600"],
        descriptionEn: "Placeholder product for bathroom.",
        descriptionAr: "منتج نائب للحمام.",
        specsEn: {"Sample": "Spec"},
        specsAr: {"نموذج": "مواصفة"},
        featured: false,
        bestSeller: false,
        newArrival: false
      },
      {
        id: "temp_decor",
        category: "decor",
        nameEn: "Sample Decor Item",
        nameAr: "عينة ديكور",
        price: 750,
        oldPrice: 950,
        discount: 20,
        stock: "in-stock",
        image: "https://via.placeholder.com/600",
        images: ["https://via.placeholder.com/600"],
        descriptionEn: "Placeholder product for decor.",
        descriptionAr: "منتج نائب للديكور.",
        specsEn: {"Sample": "Spec"},
        specsAr: {"نموذج": "مواصفة"},
        featured: false,
        bestSeller: false,
        newArrival: false
      }
    ],

    governorates: [
      { id: "cairo", nameAr: "القاهرة", nameEn: "Cairo", shipping: 50 },
      { id: "giza", nameAr: "الجيزة", nameEn: "Giza", shipping: 50 },
      { id: "alexandria", nameAr: "الإسكندرية", nameEn: "Alexandria", shipping: 65 },
      { id: "qalyubia", nameAr: "القليوبية", nameEn: "Qalyubia", shipping: 55 },
      { id: "sharqia", nameAr: "الشرقية", nameEn: "Sharqia", shipping: 60 },
      { id: "dakahlia", nameAr: "الدقهلية", nameEn: "Dakahlia", shipping: 60 },
      { id: "beheira", nameAr: "البحيرة", nameEn: "Beheira", shipping: 65 },
      { id: "gharbia", nameAr: "الغربية", nameEn: "Gharbia", shipping: 60 },
      { id: "monufia", nameAr: "المنوفية", nameEn: "Monufia", shipping: 60 },
      { id: "fayoum", nameAr: "الفيوم", nameEn: "Fayoum", shipping: 70 },
      { id: "suez", nameAr: "السويس", nameEn: "Suez", shipping: 70 },
      { id: "ismailia", nameAr: "الإسماعيلية", nameEn: "Ismailia", shipping: 70 },
      { id: "portsaid", nameAr: "بورسعيد", nameEn: "Port Said", shipping: 70 },
      { id: "asyut", nameAr: "أسيوط", nameEn: "Asyut", shipping: 80 },
      { id: "sohag", nameAr: "سوهاج", nameEn: "Sohag", shipping: 85 },
      { id: "luxor", nameAr: "الأقصر", nameEn: "Luxor", shipping: 90 },
      { id: "aswan", nameAr: "أسوان", nameEn: "Aswan", shipping: 95 }
    ]
  };

  window.BIDAYA_DATA = BIDAYA_DATA;
})();
